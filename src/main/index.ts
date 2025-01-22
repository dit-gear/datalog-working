import { app, shell, BrowserWindow, session, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/appIconlight.png?asset'
import { ProjectType } from '../shared/projectTypes'
import { loadState } from './core/app-state/loader'
import { setupIpcHandlers } from './setupIpcHandlers'
import { datalogs, appState } from './core/app-state/state'
import { openWindow } from './utils/open-window'
import { closeAllWatchers } from './core/app-state/watchers/closing'
import logger from './core/logger'
import trayManager from './core/menu'

// Initialize the application
app.setName('Datalog')

let mainWindow: BrowserWindow | null = null

// Getter function to access mainWindow
export async function getMainWindow({ ensureOpen = false } = {}): Promise<BrowserWindow | null> {
  if (mainWindow) {
    if (ensureOpen) {
      openWindow(mainWindow)
    }
  } else {
    await createWindow()
  }
  return mainWindow
}

// Function to create the main window
async function createWindow(): Promise<void> {
  const rootPath = appState.rootPath
  const projectPath = appState.activeProjectPath
  const data = appState.activeProject

  const loadedProject: ProjectType = {
    rootPath,
    ...(projectPath && { projectPath }),
    ...(data && { data })
  }

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    backgroundColor: '240 10% 3.9%',
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/mainPreload.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // **Handling did-finish-load event**
  mainWindow.webContents.on('did-finish-load', () => {
    const loadedDatalogs = Array.from(datalogs().values())
    mainWindow?.webContents.send('project-loaded', loadedProject) // Send a message to the renderer
    mainWindow?.webContents.send('datalogs-loaded', loadedDatalogs)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow && mainWindow.show() // Show the window when it's ready to be shown
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the appropriate URL or file depending on environment
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  session.defaultSession.clearCache()
  electronApp.setAppUserModelId('com.electron')
  app.dock.setIcon(icon)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpcHandlers()
  loadState()
})

app.on('window-all-closed', () => {
  // DO NOTHING. ELSE I WILL QUIT
})

process.on('SIGINT', async () => {
  logger.debug('SIGINT received. Shutting down...')
  app.quit()
})

process.on('SIGTERM', async () => {
  logger.debug('SIGTERM received. Shutting down...')
  app.quit()
})

const flushWinstonLogs = async (): Promise<void> => {
  return new Promise((resolve) => {
    logger.on('finish', resolve) // Resolves when all logs are flushed
    logger.end() // Ends the logger and flushes all pending logs
  })
}

app.on('will-quit', async (event) => {
  event.preventDefault()
  try {
    logger.debug('App is quitting. Performing cleanup...')
    BrowserWindow.getAllWindows().forEach((win) => win.destroy())
    trayManager.destroyTray()
    await closeAllWatchers()
    ipcMain.removeAllListeners()

    // Flush logs after watchers close
    await flushWinstonLogs()
    console.log('Cleanup complete. Quitting app.')
  } catch (error) {
    console.error('Error during app quit cleanup:', error)
  } finally {
    app.exit()
  }
})

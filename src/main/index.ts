import { app, shell, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ProjectType } from '../shared/projectTypes'
import { loadState } from './core/app-state/loader'
import { setupIpcHandlers } from './core/setupIpcHandlers'
import { getRootPath, getActiveProjectPath, getActiveProject } from './core/app-state/state'

// Initialize the application
app.setName('Datalog')

let mainWindow: BrowserWindow | null = null

// Getter function to access mainWindow
export async function getMainWindow(): Promise<BrowserWindow> {
  return await ensureMainWindow()
}

async function ensureMainWindow(): Promise<BrowserWindow> {
  await openMainWindow()
  return mainWindow!
}

export async function openMainWindow(): Promise<void> {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    if (!mainWindow.isVisible() || !mainWindow.isFocused()) {
      mainWindow.show()
      mainWindow.focus()
    }
    mainWindow.focus()
  } else {
    await createWindow()
  }
}

// Function to create the main window
async function createWindow(): Promise<void> {
  const rootPath = getRootPath()
  const projectPath = getActiveProjectPath()
  const data = getActiveProject()

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
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // **Handling did-finish-load event**
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('project-loaded', loadedProject) // Send a message to the renderer
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

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpcHandlers()
  loadState()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      openMainWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

import { BrowserWindow, shell } from 'electron'
import icon from '../../../resources/appIconlight.png?asset'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { openWindow } from '../utils/open-window'
import { appState, datalogs } from '../core/app-state/state'
import { ProjectType } from '@shared/projectTypes'

let mainWindow: BrowserWindow | null = null
let initialRoute: string = '/'

interface getDatalogWindowProps {
  ensureOpen?: boolean
  navigate?: 'builder' | 'settings' | 'new-project'
}

/*function waitForNavigationComplete(navigationId, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ipcMain.removeListener('navigation-complete', onNavigationComplete)
      reject(new Error('Navigation timeout'))
    }, timeout)

    const onNavigationComplete = (event, receivedId) => {
      if (receivedId === navigationId) {
        clearTimeout(timer)
        ipcMain.removeListener('navigation-complete', onNavigationComplete)
        resolve()
      }
    }

    ipcMain.once('navigation-complete', onNavigationComplete)

  })
}*/

// Getter function to access mainWindow
export async function getDatalogWindow({
  ensureOpen,
  navigate
}: getDatalogWindowProps = {}): Promise<BrowserWindow | null> {
  if (!mainWindow && (ensureOpen || navigate)) await createWindow(navigate)

  if (mainWindow) {
    const handleNavigation = () => {
      if (navigate) {
        switch (navigate) {
          case 'builder':
            mainWindow?.webContents.send('open-builder')
            break
          case 'settings':
            mainWindow?.webContents.send('open-settings')
            break
          default:
            // Optionally handle unknown navigate values
            console.warn(`Unknown navigate value: ${navigate}`)
        }
      }
      if (mainWindow && (ensureOpen || navigate)) openWindow(mainWindow)
    }
    if (mainWindow.webContents.isLoading()) {
      //
    } else {
      // If already loaded, handle navigation immediately
      handleNavigation()
    }
  }
  return mainWindow
}
/*
export async function getInitialRoute(): Promise<string> {
  return initialRoute
}

export async function showDatalogWindow(): Promise<void> {
  console.log('showWindow called')
  mainWindow && openWindow(mainWindow)
}*/

// Function to create the main window
async function createWindow(route: string = '/'): Promise<void> {
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
    backgroundColor: 'rgb(9,9,11)',
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
  /*mainWindow.webContents.on('did-finish-load', () => {
    const loadedDatalogs = Array.from(datalogs().values())
    mainWindow?.webContents.send('project-loaded', loadedProject) // Send a message to the renderer
    mainWindow?.webContents.send('datalogs-loaded', loadedDatalogs)
  })*/

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

  let url: string
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    // Dev server (e.g. http://localhost:3000/?initialRoute=/builder)
    url = `${process.env.ELECTRON_RENDERER_URL}?defaultRoute=${encodeURIComponent(route)}`
  } else {
    const fileURL = `file://${join(__dirname, '../renderer/index.html')}`
    url = `${fileURL}?defaultRoute=${encodeURIComponent(route)}`
  }
  mainWindow.loadURL(url)
  /*
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }*/
}

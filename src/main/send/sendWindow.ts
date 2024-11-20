import { BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'
import { getActiveProject } from '../core/app-state/state'
import { setupIpcHandlers } from './ipcHandlers'

let sendWindow: BrowserWindow | null = null

export function createSendWindow(): void {
  if (sendWindow) {
    sendWindow.focus()
    return
  }

  sendWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    show: false,
    backgroundColor: '#090909',
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/sendPreload.js'),
      sandbox: false,
      contextIsolation: true
    }
  })
  setupIpcHandlers()

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    sendWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/send.html`)
  } else {
    sendWindow.loadFile(join(__dirname, '../renderer/send.html'))
  }

  sendWindow.webContents.on('did-finish-load', () => {
    const activeProject = getActiveProject()
    sendWindow?.webContents.send('init-sendwindow', activeProject)
  })

  sendWindow.on('ready-to-show', () => {
    sendWindow?.show()
  })

  sendWindow.on('closed', () => {
    sendWindow = null
  })

  ipcMain.on('close-send-window', () => {
    sendWindow?.close()
  })
}

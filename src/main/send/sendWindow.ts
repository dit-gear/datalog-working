import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

let sendWindow: BrowserWindow | null = null

export function createSendWindow(): void {
  if (sendWindow) {
    sendWindow.focus()
    return
  }

  sendWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    backgroundColor: '#090909',
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    sendWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/send.html`)
  } else {
    sendWindow.loadFile(join(__dirname, '../renderer/send.html'))
  }

  sendWindow.on('closed', () => {
    sendWindow = null
  })

  /*sendWindow.webContents.once('did-finish-load', () => {
    watchDirectories(editorWindow!, getActiveProjectPath(), getAppPath())
  })*/
  //setupIpcHandlers()
}
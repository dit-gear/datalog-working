import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let aboutWindow: BrowserWindow | null

export function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus()
    return
  }

  aboutWindow = new BrowserWindow({
    width: 400,
    height: 500,
    show: false,
    backgroundColor: 'rgb(9,9,11)',
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../preload/mainPreload.js')
    }
  })

  aboutWindow.on('ready-to-show', () => {
    aboutWindow?.show()
  })

  aboutWindow.on('close', () => {
    aboutWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    aboutWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/about.html`)
  } else {
    aboutWindow.loadFile(join(__dirname, '../renderer/about.html'))
  }
}

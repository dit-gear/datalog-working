import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let onboardWindow: BrowserWindow | null = null

export function openOnboardWindow(): void {
  if (onboardWindow) {
    onboardWindow.focus()
    return
  }

  onboardWindow = new BrowserWindow({
    width: 800,
    height: 600,
    modal: true,
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    onboardWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/onboarding.html`)
  } else {
    onboardWindow.loadFile(join(__dirname, '../renderer/onboarding.html'))
  }

  onboardWindow.once('ready-to-show', () => {
    onboardWindow && onboardWindow.show()
  })

  onboardWindow.on('closed', () => {
    onboardWindow = null
  })
}

export function closeOnboardWindow(): void {
  if (onboardWindow) {
    onboardWindow.close()
    onboardWindow = null
  }
}

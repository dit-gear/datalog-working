import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/appIcondark.png?asset'

let editorWindow: BrowserWindow | null = null

export const getEditorWindow = () => {
  return editorWindow
}

export function createEditorWindow(): void {
  if (editorWindow) {
    editorWindow.focus()
    return
  }

  editorWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 580,
    minHeight: 650,
    backgroundColor: 'rgb(9,9,11)',
    autoHideMenuBar: true,
    frame: false,
    show: false,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/editorPreload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    editorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/editor.html`)
  } else {
    editorWindow.loadFile(join(__dirname, '../renderer/editor.html'))
  }

  editorWindow.webContents.openDevTools({ mode: 'detach' })

  editorWindow.on('closed', () => {
    editorWindow = null
  })
}

import { BrowserWindow } from 'electron'
import { join } from 'path'
import { watchDirectories } from '../utils/editor-file-handler'
import { getActiveProjectPath, getAppPath } from '../core/app-state/state'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'
import { setupIpcHandlers } from './ipcHandlers'

let editorWindow: BrowserWindow | null = null

export function createEditorWindow(): void {
  if (editorWindow) {
    editorWindow.focus()
    return
  }

  editorWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    backgroundColor: '#090909',
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    editorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/editor.html`)
  } else {
    editorWindow.loadFile(join(__dirname, '../renderer/editor.html'))
  }

  editorWindow.on('closed', () => {
    editorWindow = null
  })

  editorWindow.webContents.once('did-finish-load', () => {
    watchDirectories(editorWindow!, getActiveProjectPath(), getAppPath())
  })

  setupIpcHandlers()
}

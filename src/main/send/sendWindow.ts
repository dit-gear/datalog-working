import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'
import { sendWindowDataMap } from '../core/app-state/state'
import { emailType } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'

//let sendWindow: BrowserWindow | null = null

/*export const getSendWindow = (): BrowserWindow | undefined => {
  if (sendWindow && !sendWindow.isDestroyed()) {
    return sendWindow
  }
  return
}*/

export const getSendWindow = (windowId: number): BrowserWindow | undefined => {
  const data = sendWindowDataMap.get(windowId)
  if (data?.window && !data.window.isDestroyed()) {
    return data.window
  }
  return undefined
}

export function createSendWindow(
  selectedEmail?: emailType,
  selection?: DatalogType | DatalogType[]
): void {
  /*if (sendWindow) {
    if (!sendWindow.isDestroyed()) {
      sendWindow.focus()
      return
    }
    sendWindow = null
  }*/

  const sendWindow = new BrowserWindow({
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

  sendWindowDataMap.set(sendWindow.webContents.id, {
    window: sendWindow,
    selectedEmail,
    selection
  })

  const windowId = sendWindow.webContents.id

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    sendWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/send.html`)
  } else {
    sendWindow.loadFile(join(__dirname, '../renderer/send.html'))
  }

  sendWindow.on('closed', () => {
    //ipcMain.removeHandler(`close-send-window`)
    sendWindowDataMap.delete(windowId)
  })
}

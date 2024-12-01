// ipcHandlers.ts
import { ipcMain } from 'electron'
import fs from 'fs/promises'
import { InitialSendData } from '@shared/shared-types'
import {
  getActiveProject,
  datalogs as datalogStore,
  sendWindowDataMap
} from '../core/app-state/state'
import { getSendWindow } from './sendWindow'

export function setupSendIpcHandlers(): void {
  ipcMain.handle('initial-send-data', async (event): Promise<InitialSendData> => {
    try {
      const project = getActiveProject()
      const datalogs = Array.from(datalogStore().values())
      if (!project) throw Error
      const windowId = event.sender.id
      const { selectedEmail, selection } = sendWindowDataMap.get(windowId) || {}

      return { selectedEmail, project, selection, datalogs }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(`Failed to load send window data: ${message}`)
    }
  })
  ipcMain.on('show-send-window', (event) => {
    const sendWindow = getSendWindow(event.sender.id)
    sendWindow?.show()
  })
  ipcMain.on(`close-send-window`, (event) => {
    const sendWindow = getSendWindow(event.sender.id)
    if (sendWindow) {
      sendWindow.close()
    }
  })
  ipcMain.handle('get-file-content', async (_event, filePath: string) => {
    try {
      await fs.access(filePath)
      const content = await fs.readFile(filePath, 'utf8')
      return content
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(`Failed to read file: ${message}`)
    }
  })
}

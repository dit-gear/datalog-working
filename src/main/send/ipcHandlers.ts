// ipcHandlers.ts
import { ipcMain } from 'electron'
import fs from 'fs/promises'
import { InitialSendData } from '@shared/shared-types'
import { getActiveProject, datalogs as datalogStore } from '../core/app-state/state'
import { getSendWindow } from './sendWindow'

export function setupSendIpcHandlers(): void {
  ipcMain.handle('initial-send-data', async (): Promise<InitialSendData> => {
    try {
      const project = getActiveProject()
      const datalogs = Array.from(datalogStore().values())
      if (!project) throw Error
      return { project, datalogs }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(`Failed to load send window data: ${message}`)
    }
  })
  ipcMain.on('show-send-window', () => {
    const sendWindow = getSendWindow()
    sendWindow?.show()
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

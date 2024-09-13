import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { FileInfo } from '../../../../shared/shared-types'
import { DatalogType, ResponseWithClips } from '@shared/datalogTypes'
import { getActiveProjectPath } from '../../app-state/state'
import logger from '../../logger'
import ParseOCF from './parse-ocf'
import removeOcf from './remove-ocf'

export function setupDatalogBuilderIpcHandlers(): void {
  ipcMain.handle('findOcf', async (): Promise<ResponseWithClips> => {
    return await ParseOCF()
  })

  ipcMain.handle('removeLogPath', async (_, paths: string[]): Promise<ResponseWithClips> => {
    return await removeOcf(paths)
  })

  ipcMain.handle('getOfflineFolderDetails', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { folderSize: 0, files: [] }
    }

    const folderPath = result.filePaths[0]
    const getFolderDetails = (dirPath: string): { folderSize: number; files: FileInfo[] } => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      let folderSize = 0
      const fileDetails: FileInfo[] = []

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const stats = fs.statSync(fullPath)

        if (entry.isDirectory()) {
          const subfolderDetails = getFolderDetails(fullPath)
          folderSize += subfolderDetails.folderSize
          fileDetails.push(...subfolderDetails.files)
        } else if (entry.isFile()) {
          folderSize += stats.size
          fileDetails.push({
            filename: entry.name.split('.')[0],
            size: stats.size
          })
        }
      }

      return { folderSize, files: fileDetails }
    }

    const { folderSize, files: fileDetails } = getFolderDetails(folderPath)

    return { folderPath, folderSize, files: fileDetails }
  })

  ipcMain.handle('getDocumentsFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return result.filePaths[0]
    }
  })

  ipcMain.handle('getFolderPath', async () => {
    logger.info('FolderPath function started')
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        logger.info('getFolderPath canceled')
        return null
      } else {
        logger.info('sending back path')
        return result.filePaths[0]
      }
    } catch (error) {
      logger.error(`error ${error}`)
    }
  })

  ipcMain.handle('save-entry', async (_event, data: DatalogType) => {
    try {
      const yaml = YAML.stringify(data)
      const filepath = path.join(getActiveProjectPath(), `${data.Folder}.datalog`)
      fs.writeFileSync(filepath, yaml, 'utf8')
      return { success: true }
    } catch (error) {
      dialog.showErrorBox('Error', 'Failed to save entry')
      return { success: false }
    }
  })
}

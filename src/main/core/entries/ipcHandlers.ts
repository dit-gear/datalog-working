import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import processALE from '../../utils/process-ale'
import processMHL from '../../utils/process-mhl'
import getVolumeName from '../../utils/get-volume'
import findFilesByType from '../../utils/find-files-by-type'
import { FileInfo, entryType } from '../../../shared/shared-types'
import { getMainWindow } from '../../index'
import { getActiveProjectPath } from '../app-state/state'
import logger from '../logger'

export function setupEntriesIpcHandlers(): void {
  ipcMain.handle('findOcf', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })

      if (result.canceled) return // Handle user canceling the dialog
      const mainWindow = getMainWindow()
      if (!mainWindow) {
        logger.error('No main window')
        return
      }
      const volumeName = getVolumeName(result.filePaths[0])
      const mhlFiles = await findFilesByType(result.filePaths[0], 'mhl')
      const aleFiles = await findFilesByType(result.filePaths[0], 'ale')
      if (mhlFiles.length === 0) {
        dialog.showErrorBox('Error', 'No MHL files found in the selected directory.')
        return
      } else {
        const aleData = await processALE(aleFiles)
        const data = await processMHL(mhlFiles, mainWindow)
        // merge aleData and data that have the same Clip name
        const mergedData = data.map((item) => {
          const aleItem = aleData.find((ale) => ale.Clip === item.Clip)
          return { ...aleItem, ...item, Volume: volumeName }
        })

        return { volume: [volumeName], data: mergedData }
      }
    } catch (error) {
      dialog.showErrorBox('Error', 'Failed to read MHL files')
      return
    }
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
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null
    } else {
      return result.filePaths[0]
    }
  })

  ipcMain.handle('save-entry', async (_event, data: entryType) => {
    try {
      const yaml = YAML.stringify(data)
      const filepath = path.join(getActiveProjectPath(), `${data.Folder}.yaml`)
      fs.writeFileSync(filepath, yaml, 'utf8')
      return { success: true }
    } catch (error) {
      dialog.showErrorBox('Error', 'Failed to save entry')
      return { success: false }
    }
  })

  ipcMain.handle('load-entries', async () => {
    try {
      const entriesPaths = (await findFilesByType(getActiveProjectPath(), 'yaml')).filter(
        (filePath) => !path.basename(filePath).toLowerCase().includes('settings.yaml')
      )
      const entries = entriesPaths.map((entryPath): entryType => {
        const entry = fs.readFileSync(entryPath, 'utf8')
        const parsedEntry = YAML.parse(entry)
        return parsedEntry
      })
      return entries
    } catch (error) {
      dialog.showErrorBox('Error', 'Failed to load entries')
      return []
    }
  })
}

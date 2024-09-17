import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { DatalogType, ResponseWithClips } from '@shared/datalogTypes'
import { getActiveProjectPath } from '../../app-state/state'
import ParseOCF from './parse-ocf'
import removeOcf from './remove-ocf'
import addProxies from './add-proxies'
import removeProxies from './remove-proxies'
import parseCsv from './parse-csv'

export function setupDatalogBuilderIpcHandlers(): void {
  ipcMain.handle('findOcf', async (): Promise<ResponseWithClips> => {
    return await ParseOCF()
  })

  ipcMain.handle('removeLogPath', async (_, paths: string[]): Promise<ResponseWithClips> => {
    return await removeOcf(paths)
  })

  ipcMain.handle('getProxies', async (): Promise<ResponseWithClips> => {
    return await addProxies()
  })

  ipcMain.handle('removeProxies', async (): Promise<ResponseWithClips> => {
    return await removeProxies()
  })

  ipcMain.handle('getCsvMetadata', async (): Promise<ResponseWithClips> => {
    return await parseCsv()
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

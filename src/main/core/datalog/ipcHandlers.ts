import { ipcMain } from 'electron'
import { DatalogType, ResponseWithClips, ResponseWithDatalogs } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import ParseOCF from './builder/parse-ocf'
import removeOcf from './builder/remove-ocf'
import addProxies from './builder/add-proxies'
import removeProxies from './builder/remove-proxies'
import parseCsv from './builder/parse-csv'
import updateDatalog from './updater'
import loadDatalogs from './loader'
import deleteDatalog from './delete'

export function setupDatalogIpcHandlers(): void {
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

  ipcMain.handle('update-datalog', async (_, datalog: DatalogType): Promise<Response> => {
    return await updateDatalog(datalog)
  })
  ipcMain.handle('load-datalogs', async (): Promise<ResponseWithDatalogs> => {
    return await loadDatalogs()
  })
  ipcMain.handle('delete-datalog', async (_, datalog: DatalogType): Promise<Response> => {
    return await deleteDatalog(datalog)
  })
}

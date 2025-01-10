import { ipcMain } from 'electron'
import { DatalogType, ResponseWithClips } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import ParseOCF from './builder/parse-ocf'
import removeOcf from './builder/remove-ocf'
import addProxies from './builder/add-proxies'
import parseCsv from './builder/parse-csv'
import updateDatalog from './updater'
import deleteDatalog from './delete'
import { createSendWindow } from '../../send/sendWindow'

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

  ipcMain.handle('getCsvMetadata', async (): Promise<ResponseWithClips> => {
    return await parseCsv()
  })

  ipcMain.handle('update-datalog', async (_, datalog: DatalogType): Promise<Response> => {
    return await updateDatalog(datalog)
  })

  ipcMain.handle('delete-datalog', async (_, datalog: DatalogType): Promise<Response> => {
    return await deleteDatalog(datalog)
  })

  ipcMain.on('open-send-window', (_, selection: DatalogType | DatalogType[]) => {
    createSendWindow(undefined, selection)
  })
}

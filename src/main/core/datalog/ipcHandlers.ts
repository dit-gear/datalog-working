import { ipcMain } from 'electron'
import { DatalogType, ResponseWithClips } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import addOCF from './builder/add-ocf'
import addSound from './builder/add-sound'
import addProxies from './builder/add-proxies'
import addCustom from './builder/add-custom'
import { removeOcf, removeSound } from './builder/remove-ocf'
import updateDatalog from './updater'
import deleteDatalog from './delete'
import { createSendWindow } from '../../send/sendWindow'

export function setupDatalogIpcHandlers(): void {
  ipcMain.handle(
    'getClips',
    async (_, type: 'ocf' | 'sound' | 'proxy' | 'custom'): Promise<ResponseWithClips> => {
      switch (type) {
        case 'ocf':
          return await addOCF()
        case 'sound':
          return await addSound()
        case 'proxy':
          return await addProxies()
        case 'custom':
          return await addCustom()
        default:
          throw new Error(`Unknown type: ${type}`)
      }
    }
  )

  ipcMain.handle(
    'removeClips',
    async (_, paths: string[], type: 'ocf' | 'sound'): Promise<ResponseWithClips> => {
      switch (type) {
        case 'ocf':
          return await removeOcf(paths)
        case 'sound':
          return await removeSound(paths)
        default:
          throw new Error(`Unknown type: ${type}`)
      }
    }
  )

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

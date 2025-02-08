import { ipcMain, dialog } from 'electron'
import { DatalogType, OcfClipType, ResponseWithClips, SoundClipType } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import { spawnWorker } from './builder/workers/workerManager'
import addDefaults from './builder/add-defaults'
import checkPaths from './builder/check-paths'
import { removeOcf, removeSound } from './builder/remove'
import updateDatalog from './updater'
import deleteDatalog from './delete'
import { createSendWindow } from '../../send/sendWindow'
import logger from '../logger'
import { additionalParsing } from '@shared/projectTypes'
import { appState, datalogs } from '../app-state/state'
import { ProjectType } from '@shared/projectTypes'

export function setupDatalogIpcHandlers(): void {
  ipcMain.handle(
    'checkPaths',
    async (
      _,
      paths: { ocf: string[] | null; sound: string[] | null; proxy: string | null }
    ): Promise<{
      ocf: { path: string; available: boolean }[] | null
      sound: { path: string; available: boolean }[] | null
      proxy: { path: string; available: boolean } | null
    }> => {
      return await checkPaths(paths)
    }
  ),
    ipcMain.handle(
      'getDefaultClips',
      async (
        _,
        paths: { ocf: string[] | null; sound: string[] | null; proxy: string | null }
      ): Promise<ResponseWithClips> => {
        return await addDefaults(paths)
      }
    )
  ipcMain.handle(
    'getClips',
    async (
      _,
      type: 'ocf' | 'sound' | 'proxy' | 'custom',
      storedClips: OcfClipType[] | SoundClipType[]
    ): Promise<ResponseWithClips> => {
      let paths: string | string[] | null = null
      let custom_fields: additionalParsing | undefined
      if (type === 'custom') {
        const csvdialog = await dialog.showOpenDialog({
          title: 'Select a CSV file',
          filters: [{ name: 'CSV Files', extensions: ['csv'] }],
          properties: ['openFile']
        })
        if (csvdialog.canceled) return { success: false, error: 'User cancelled', cancelled: true }
        paths = csvdialog.filePaths
        custom_fields = appState.activeProject?.custom_fields
      } else {
        const dialogResult = await dialog.showOpenDialog({ properties: ['openDirectory'] })
        if (dialogResult.canceled)
          return { success: false, error: 'User cancelled', cancelled: true }
        paths = dialogResult.filePaths
      }
      if (!paths) {
        return { success: false, error: 'No valid path selected' }
      }

      let scriptName = ''
      switch (type) {
        case 'ocf':
          scriptName = 'addOCFWorker'
          break
        case 'sound':
          scriptName = 'addSoundWorker'
          break
        case 'proxy':
          scriptName = 'addProxyWorker'
          break
        case 'custom':
          scriptName = 'addCustomWorker'
          break
        default:
          return { success: false, error: `Unknown type: ${type}` }
      }

      try {
        console.log('scriptname:', scriptName)
        const { promise } = spawnWorker(scriptName, { paths, storedClips, custom_fields })
        return await promise
      } catch (error) {
        logger.error(error?.toString())
        return { success: false, error: String(error) }
      }
    }
  )

  ipcMain.handle(
    'removeClips',
    async (
      _,
      paths: string[],
      type: 'ocf' | 'sound',
      storedClips: OcfClipType[] | SoundClipType[]
    ): Promise<ResponseWithClips> => {
      switch (type) {
        case 'ocf':
          return await removeOcf(paths, storedClips)
        case 'sound':
          return await removeSound(paths, storedClips)
        default:
          throw new Error(`Unknown type: ${type}`)
      }
    }
  )

  ipcMain.handle(
    'update-datalog',
    async (_, datalog: DatalogType, isNew: boolean): Promise<Response> => {
      return await updateDatalog(datalog, isNew)
    }
  )

  ipcMain.handle('delete-datalog', async (_, datalog: DatalogType): Promise<Response> => {
    return await deleteDatalog(datalog)
  })

  ipcMain.on('open-send-window', (_, selection: DatalogType | DatalogType[]) => {
    createSendWindow(null, selection)
  })

  ipcMain.handle('get-project', (): ProjectType => {
    const rootPath = appState.rootPath
    const projectPath = appState.activeProjectPath
    const data = appState.activeProject

    const loadedProject: ProjectType = {
      rootPath,
      ...(projectPath && { projectPath }),
      ...(data && { data })
    }
    return loadedProject
  })

  ipcMain.handle('get-datalogs', (): DatalogType[] => {
    return Array.from(datalogs().values())
  })
}

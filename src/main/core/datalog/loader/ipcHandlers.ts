import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import YAML from 'yaml'
import findFilesByType from '../../../utils/find-files-by-type'
import { DatalogType } from '@shared/datalogTypes'
import { getActiveProjectPath } from '../../app-state/state'

export function setupDatalogLoadingIpcHandlers(): void {
  ipcMain.handle('load-entries', async () => {
    try {
      const entriesPaths = await findFilesByType(getActiveProjectPath(), 'datalog', { maxDepth: 0 })
      const entries = entriesPaths.map((entryPath): DatalogType => {
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

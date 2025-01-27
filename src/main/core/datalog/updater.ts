import fs from 'fs/promises'
import path from 'path'
import YAML from 'yaml'
import logger from '../logger'
import { appState } from '../app-state/state'
import { DatalogType } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import { ensureDirectoryExists, fileExists } from '../../utils/crud'
import { getMainWindow } from '../../index'
import { ipcMain } from 'electron'

const updateDatalog = async (data: DatalogType, isNew: boolean): Promise<Response> => {
  const win = await getMainWindow()
  try {
    await ensureDirectoryExists(path.join(appState.activeProjectPath, 'logs'))
    const yaml = YAML.stringify(data)
    const filepath = path.join(appState.activeProjectPath, 'logs', `${data.id}.datalog`)
    const file = await fileExists(filepath)
    if (file && isNew) {
      win?.webContents.send('show-overwrite-confirmation', path.basename(filepath))

      const shouldOverwrite = await new Promise<boolean>((resolve) => {
        const handler = (_, response: boolean) => {
          resolve(response)
          ipcMain.removeListener('overwrite-response', handler)
        }
        ipcMain.on('overwrite-response', handler)
      })

      if (!shouldOverwrite) {
        return { success: false, error: 'User canceled the overwrite.', cancelled: true }
      }
    }

    await fs.writeFile(filepath, yaml, 'utf8')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error(message)
    logger.error(`Error saving/updating datalog: ${message}`)
    return { success: false, error: message }
  }
}

export default updateDatalog

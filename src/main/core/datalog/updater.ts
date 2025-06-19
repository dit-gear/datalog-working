import fs from 'fs/promises'
import path from 'path'
import YAML from 'yaml'
import logger from '../logger'
import { appState } from '../app-state/state'
import { DatalogType } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import { ensureDirectoryExists, fileExists } from '../../utils/crud'
import { getDatalogWindow } from '../../datalog/datalogWindow'
import { ipcMain, dialog } from 'electron'
import deleteDatalog from './delete'

const updateDatalog = async (data: DatalogType, oldDatalog?: DatalogType): Promise<Response> => {
  const win = await getDatalogWindow()
  try {
    await ensureDirectoryExists(path.join(appState.activeProjectPath, 'logs'))
    const { id, ...rest } = data
    const yaml = YAML.stringify(rest)
    const filepath = path.join(appState.activeProjectPath, 'logs', `${id}.dayta`)
    const file = await fileExists(filepath)
    if (file && !oldDatalog) {
      if (win) {
        win.webContents.send('show-overwrite-confirmation', path.basename(filepath))

        const shouldOverwrite = await new Promise<boolean>((resolve) => {
          const handler = (_: any, response: boolean) => {
            resolve(response)
            ipcMain.removeListener('overwrite-response', handler)
          }
          ipcMain.on('overwrite-response', handler)
        })

        if (!shouldOverwrite) {
          return { success: false, error: 'User canceled the overwrite.', cancelled: true }
        }
      } else {
        const response = dialog.showMessageBoxSync({
          type: 'question',
          buttons: ['Overwrite', 'Cancel'],
          defaultId: 0,
          cancelId: 1,
          title: 'Overwrite Confirmation',
          message: `The file ${path.basename(filepath)} already exists. Do you want to overwrite it?`
        })
        if (response !== 0) {
          return { success: false, error: 'User canceled the overwrite.', cancelled: true }
        }
      }
    }
    await fs.writeFile(filepath, yaml, 'utf8')

    if (oldDatalog && oldDatalog.id !== id) await deleteDatalog(oldDatalog)

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error(message)
    logger.error(`Error saving/updating datalog: ${message}`)
    return { success: false, error: message }
  }
}

export default updateDatalog

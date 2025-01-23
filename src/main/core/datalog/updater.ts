import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import logger from '../logger'
import { appState } from '../app-state/state'
import { DatalogType } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import { ensureDirectoryExists } from '../../utils/crud'
import { clearClipsStore } from './builder/builder-state'

const updateDatalog = async (data: DatalogType): Promise<Response> => {
  try {
    await ensureDirectoryExists(path.join(appState.activeProjectPath, 'logs'))
    const yaml = YAML.stringify(data)
    const filepath = path.join(appState.activeProjectPath, 'logs', `${data.id}.datalog`)
    fs.writeFileSync(filepath, yaml, 'utf8')
    await clearClipsStore()
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error(message)
    logger.error(`Error saving/updating datalog: ${message}`)
    return { success: false, error: message }
  }
}

export default updateDatalog

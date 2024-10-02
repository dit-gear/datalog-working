import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import logger from '../logger'
import { getActiveProjectPath } from '../app-state/state'
import { DatalogType } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'

const updateDatalog = async (data: DatalogType): Promise<Response> => {
  try {
    const yaml = YAML.stringify(data)
    const filepath = path.join(getActiveProjectPath(), `${data.Folder}.datalog`)
    fs.writeFileSync(filepath, yaml, 'utf8')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error(message)
    logger.error(`Error saving/updating datalog: ${message}`)
    return { success: false, error: message }
  }
}

export default updateDatalog

import fs from 'fs'
import YAML from 'yaml'
import logger from '../logger'
import { DatalogType, ResponseWithDatalogs } from '@shared/datalogTypes'
import { getActiveProjectPath } from '../app-state/state'
import findFilesByType from '../../utils/find-files-by-type'

const loadDatalogs = async (): Promise<ResponseWithDatalogs> => {
  try {
    const datalogsPaths = await findFilesByType(getActiveProjectPath(), 'datalog', { maxDepth: 0 })
    const datalogs = datalogsPaths.map((datalogPath): DatalogType => {
      const datalog = fs.readFileSync(datalogPath, 'utf8')
      const parsedDatalog = YAML.parse(datalog)
      return parsedDatalog
    })
    return { success: true, datalogs: datalogs }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    logger.error(`Error loading datalogs: ${message}`)
    return { success: false, error: message }
  }
}

export default loadDatalogs

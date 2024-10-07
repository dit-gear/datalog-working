import fs from 'fs'
import YAML from 'yaml'
import logger from '../logger'
import { DatalogDynamicType, ResponseWithDatalogs } from '@shared/datalogTypes'
import { getActiveProjectPath, getActiveProject } from '../app-state/state'
import findFilesByType from '../../utils/find-files-by-type'
import { DatalogDynamicZod } from '@shared/datalogTypes'

const loadDatalogs = async (): Promise<ResponseWithDatalogs> => {
  try {
    const datalogsPaths = await findFilesByType(getActiveProjectPath(), 'datalog', { maxDepth: 0 })
    const datalogs = datalogsPaths.map((datalogPath) => {
      const datalog = fs.readFileSync(datalogPath, 'utf8')
      const yamlDatalog = YAML.parse(datalog)
      const project = getActiveProject()
      if (!project) throw Error
      const parsedDatalog = DatalogDynamicZod(project, {
        transformDurationToMs: true
      }).parse(yamlDatalog) as DatalogDynamicType
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

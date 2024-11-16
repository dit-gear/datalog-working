import fs from 'fs'
import YAML from 'yaml'
import logger from '../logger'
import { DatalogDynamicType } from '@shared/datalogTypes'
import { getActiveProject } from '../app-state/state'
import { DatalogDynamicZod } from '@shared/datalogTypes'

export const loadDatalog = async (filePath: string): Promise<DatalogDynamicType> => {
  const project = getActiveProject()
  if (!project) throw new Error('No active project found')
  try {
    const datalog = fs.readFileSync(filePath, 'utf8')
    const yamlDatalog = YAML.parse(datalog)
    const parsedDatalog = DatalogDynamicZod(project, {
      transformDurationToMs: true
    }).parse(yamlDatalog) as DatalogDynamicType
    return parsedDatalog
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    logger.error(`Error loading datalog at ${filePath}: ${message}`)
    throw new Error(message)
  }
}

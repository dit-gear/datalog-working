import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import logger from '../logger'
import { DatalogDynamicType } from '@shared/datalogTypes'
import { appState } from '../app-state/state'
import { DatalogDynamicZod } from '@shared/datalogTypes'
import { Notification } from 'electron'

export const loadDatalog = async (filePath: string): Promise<DatalogDynamicType> => {
  const project = appState.project
  if (!project) throw new Error('No active project found')
  try {
    const datalog = fs.readFileSync(filePath, 'utf8')
    const { name } = path.parse(filePath)
    const yamlDatalog = YAML.parse(datalog)
    const log = { id: name, ...yamlDatalog }
    const parsedDatalog = DatalogDynamicZod(project).parse(log) as DatalogDynamicType
    return parsedDatalog
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    logger.error(`Error loading datalog at ${filePath}: ${message}`)
    const notification = new Notification({
      title: `Error loading datalog at ${filePath}`,
      body: message
    })
    notification.show()
    throw new Error(message)
  }
}

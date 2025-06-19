import logger from '../logger'
import { DatalogDynamicType } from '@shared/datalogTypes'
import { appState } from '../app-state/state'
import { nativeImage, Notification } from 'electron'
import erroricon from '../../../../resources/error_icon.png?asset'
import { parseLog } from 'daytalog'

export const loadDatalog = async (filePath: string): Promise<DatalogDynamicType> => {
  const project = appState.project
  if (!project) throw new Error('No active project found')
  try {
    return await parseLog(filePath, project)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    logger.error(`Error loading log at ${filePath}: ${message}`)
    const notification = new Notification({
      title: `Error loading log at ${filePath}`,
      body: message,
      icon: nativeImage.createFromPath(erroricon)
    })
    notification.show()
    throw new Error(message)
  }
}

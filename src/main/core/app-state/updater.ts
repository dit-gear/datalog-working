import { app, safeStorage } from 'electron'
import fs from 'fs'
import path from 'path'
import { state, error } from './types'
import { appState } from './state'
import logger from '../logger'

interface updateProps {
  setActiveProject: string | null
}

async function saveStateToFile(data: state): Promise<error | undefined> {
  try {
    const filePath = path.join(app.getPath('userData'), 'appconfig.json')
    const encryptedData = safeStorage.encryptString(JSON.stringify(data))
    fs.writeFileSync(filePath, encryptedData, 'utf8')
    return
  } catch (error) {
    return { error: true, message: 'Failed to write or encrypt the file' }
  }
}

export async function updateState({ setActiveProject }: updateProps): Promise<void> {
  logger.debug('update state started')
  try {
    logger.debug('updatestate-newActiveProject: ', setActiveProject)
    appState.activeProjectPath = setActiveProject
    await saveStateToFile({ activeProject: setActiveProject })
    logger.debug(`State updated. Project: ${setActiveProject}`)
  } catch (error) {
    logger.error('Error in updateState: ', error)
  }
}

import { app, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { state, error } from './types'
import { encryptData } from '../../utils/encryption'
import { appState } from './state'
import logger from '../logger'
import { loadProjectsInRootPath } from '../project/loader'
import { getDatalogWindow } from '../../datalog/datalogWindow'
import { unloadProject } from '../project/unload'
import { closeRootWatcher, initRootWatcher } from './watchers/rootWatcher'

interface updateProps {
  newRootPath?: string
  newActiveProject?: string
}

async function saveStateToFile(data: state): Promise<error | undefined> {
  try {
    const filePath = path.join(app.getPath('userData'), 'appconfig.json')
    const encryptedData = encryptData(data)
    fs.writeFileSync(filePath, JSON.stringify(encryptedData), 'utf8')
    return
  } catch (error) {
    return { error: true, message: 'Failed to write or encrypt the file' }
  }
}

export async function updateState({ newRootPath, newActiveProject }: updateProps): Promise<void> {
  try {
    const rootPath = newRootPath ? newRootPath : appState.rootPath
    logger.debug('updatestate-newActiveProject: ', newActiveProject)
    const activeProject = newActiveProject ?? null
    logger.debug('updatestate-activeProject: ', activeProject)
    await saveStateToFile({ rootPath, activeProject })
    newRootPath && (appState.rootPath = newRootPath)
    appState.activeProjectPath = activeProject
    logger.debug(`State updated. Root: ${rootPath} Project: ${activeProject}`)
  } catch (error) {
    logger.error('Error in updateState: ', error)
  }
}

export const handleRootDirChange = async (): Promise<void> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled) {
    return
  } else {
    try {
      const newRootPath = result.filePaths[0].endsWith('/Datalog')
        ? result.filePaths[0]
        : path.join(result.filePaths[0], 'Datalog')
      if (!fs.existsSync(newRootPath)) {
        fs.mkdirSync(newRootPath)
      }
      await Promise.allSettled([unloadProject(), closeRootWatcher()])
      await updateState({ newRootPath })
      await loadProjectsInRootPath()
      await initRootWatcher()
      getDatalogWindow({ update: true })
    } catch (error) {
      logger.error(`Error changing root: ${error}`)
    }
  }
}

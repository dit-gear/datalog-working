import { app, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { state, error } from './types'
import { encryptData } from '../../utils/encryption'
import { getRootPath, setRootPath, setActiveProjectPath } from './state'
import logger from '../logger'
import { loadProjectsInRootPath } from '../project/loader'
import { getMainWindow } from '../../index'

interface updateProps {
  newRootPath?: string
  newActiveProject?: string
}

async function saveStateToFile(data: state): Promise<error | undefined> {
  try {
    const filePath = path.join(app.getPath('userData'), 'config.json')
    const encryptedData = encryptData(data)
    fs.writeFileSync(filePath, JSON.stringify(encryptedData), 'utf8')
    return
  } catch (error) {
    return { error: true, message: 'Failed to write or encrypt the file' }
  }
}

export async function updateState({ newRootPath, newActiveProject }: updateProps): Promise<void> {
  const rootPath = newRootPath ? newRootPath : getRootPath()
  const activeProject = newActiveProject ? newActiveProject : ''
  await saveStateToFile({ rootPath, activeProject })
  newRootPath && setRootPath(newRootPath)
  setActiveProjectPath(activeProject)
  logger.debug(`State updated. Root: ${rootPath} Project: ${activeProject}`)
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
      updateState({ newRootPath })
      await loadProjectsInRootPath()
      const mainWindow = await getMainWindow()
      mainWindow?.webContents.send('project-loaded', {
        newRootPath
      })
    } catch (error) {
      logger.error(`Error changing root: ${error}`)
    }
  }
}

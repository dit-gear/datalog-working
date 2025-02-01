import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { appState } from '../app-state/state'
import { getDatalogWindow } from '../../datalog/datalogWindow'
import trayManager from '../menu'
import {
  closeProjectWatchers,
  initProjectWatchers
} from '../app-state/watchers/projectWatchers/manager'
import logger from '../logger'

export const handleChangeProject = async (selectedProjectPath: string): Promise<void> => {
  logger.debug('handleChangeProject started')
  try {
    await closeProjectWatchers()
    const activeProject = await loadProject(selectedProjectPath)
    updateState({ newActiveProject: selectedProjectPath })
    const data = activeProject.data

    // Insert function here.
    const projectsInRootPath = appState.projectsInRootPath || []
    const updatedProjects = projectsInRootPath?.map((project) => ({
      ...project,
      active: project.path === selectedProjectPath
    }))
    appState.projectsInRootPath = updatedProjects
    await initProjectWatchers()
    trayManager.createOrUpdateTray()

    const mainWindow = await getDatalogWindow()

    mainWindow?.webContents.send('project-loaded', {
      rootPath: appState.rootPath,
      projectPath: selectedProjectPath,
      data
    })
    logger.debug('handleChangeProject completed successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('handleChangeProject error:', message)
  }
}

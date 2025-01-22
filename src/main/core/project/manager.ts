import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { getRootPath, getProjectsInRootPath, setProjectsInRootPath } from '../app-state/state'
import { getMainWindow } from '../../index'
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
    const projectsInRootPath = getProjectsInRootPath() || []
    const updatedProjects = projectsInRootPath?.map((project) => ({
      ...project,
      active: project.path === selectedProjectPath
    }))
    setProjectsInRootPath(updatedProjects)
    await initProjectWatchers()
    trayManager.createOrUpdateTray()

    const mainWindow = await getMainWindow()

    mainWindow?.webContents.send('project-loaded', {
      rootPath: getRootPath(),
      projectPath: selectedProjectPath,
      data
    })
    logger.debug('handleChangeProject completed successfully')
  } catch (error) {
    logger.error('handleChangeProject error:', error)
  }
}

import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { appState } from '../app-state/state'
import { getDatalogWindow } from '../../datalog/datalogWindow'
import trayManager from '../menu'
import { initProjectWatchers } from '../app-state/watchers/projectWatchers/manager'
import logger from '../logger'
import { unloadProject } from './unload'

export const handleChangeProject = async (selectedProjectPath: string): Promise<void> => {
  logger.debug('handleChangeProject, selected project: ', selectedProjectPath)
  try {
    await unloadProject()
    await loadProject(selectedProjectPath)
    await updateState({ newActiveProject: selectedProjectPath })
    const projectsInRootPath = appState.projectsInRootPath || []
    const updatedProjects = projectsInRootPath?.map((project) => ({
      ...project,
      active: project.path === selectedProjectPath
    }))
    appState.projectsInRootPath = updatedProjects
    await initProjectWatchers()
    trayManager.createOrUpdateTray()
    getDatalogWindow({ update: true })
    logger.debug('handleChangeProject completed successfully')
  } catch (error) {
    logger.error('handleChangeProject error:', error)
  }
}

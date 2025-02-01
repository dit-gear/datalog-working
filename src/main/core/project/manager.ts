import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { appState } from '../app-state/state'
import { getDatalogWindow } from '../../datalog/datalogWindow'
import trayManager from '../menu'
import { initProjectWatchers } from '../app-state/watchers/projectWatchers/manager'
import logger from '../logger'
import { unloadProject } from './unload'

export const handleChangeProject = async (selectedProjectPath: string): Promise<void> => {
  logger.debug('handleChangeProject started')
  try {
    await unloadProject()
    await loadProject(selectedProjectPath)
    await updateState({ newActiveProject: selectedProjectPath })
    // Insert function here.
    const projectsInRootPath = appState.projectsInRootPath || []
    const updatedProjects = projectsInRootPath?.map((project) => ({
      ...project,
      active: project.path === selectedProjectPath
    }))
    appState.projectsInRootPath = updatedProjects
    await initProjectWatchers()
    trayManager.createOrUpdateTray()

    logger.debug('handleChangeProject completed successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('handleChangeProject error:', message)
  }
}

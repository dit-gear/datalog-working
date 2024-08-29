import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { getRootPath, getActiveProjectPath } from '../app-state/state'
import { getMainWindow } from '../../index'
import { updateEnabledMenuItem } from '../menu'

export const handleChangeProject = async (selectedProjectPath: string): Promise<void> => {
  const activeProject = await loadProject(selectedProjectPath)
  const previousPath = getActiveProjectPath()
  const projectPath = selectedProjectPath
  updateState({ newActiveProject: selectedProjectPath })
  const data = activeProject.data
  updateEnabledMenuItem(projectPath, previousPath)
  getMainWindow()?.webContents.send('project-loaded', {
    rootPath: getRootPath(),
    projectPath: selectedProjectPath,
    data
  })
}

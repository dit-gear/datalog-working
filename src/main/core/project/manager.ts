import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { getRootPath, getProjectsInRootPath, setProjectsInRootPath } from '../app-state/state'
import { getMainWindow } from '../../index'
import { updateTray } from '../menu'

export const handleChangeProject = async (selectedProjectPath: string): Promise<void> => {
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
  updateTray()

  const mainWindow = await getMainWindow()

  mainWindow.webContents.send('project-loaded', {
    rootPath: getRootPath(),
    projectPath: selectedProjectPath,
    data
  })
}

import { ipcMain } from 'electron'
import { createNewProject } from './creator'
import { updateProject } from './updater'
import { CreateNewProjectResult, UpdateProjectResult, ProjectToUpdate } from '@shared/projectTypes'

export function setuProjectIpcHandlers(): void {
  ipcMain.handle(
    'create-new-project',
    async (_event, projectName: string): Promise<CreateNewProjectResult> =>
      createNewProject(projectName)
  )
  ipcMain.handle(
    'update-project',
    async (_event, project: ProjectToUpdate): Promise<UpdateProjectResult> => updateProject(project)
  )
}

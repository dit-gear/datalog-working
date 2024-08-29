import { ipcMain } from 'electron'
import { createNewProject } from './creator'
import { CreateNewProjectResult } from './types'

export function setuProjectIpcHandlers(): void {
  ipcMain.handle(
    'create-new-project',
    async (_event, projectName: string): Promise<CreateNewProjectResult> =>
      createNewProject(projectName)
  )
}

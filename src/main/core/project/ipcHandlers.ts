import { ipcMain } from 'electron'
import { createNewProject } from './creator'
import { updateProject } from './updater'
import { CreateNewProjectResult, UpdateProjectResult, ProjectToUpdate } from '@shared/projectTypes'
import { ResponseWithString } from '@shared/shared-types'
import logger from '../logger'
import { dialog } from 'electron'

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

  ipcMain.handle('getFolderPath', async (): Promise<ResponseWithString> => {
    logger.info('FolderPath function started')
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })
      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        logger.debug('getFolderPath canceled')
        return { success: false, error: 'user cancelled', cancelled: true }
      } else {
        logger.debug('sending back path')
        return { success: true, data: result.filePaths[0] }
      }
    } catch (error) {
      const message = `Error getting folderpath: ${error instanceof Error ? error.message : 'unknown error'}`
      logger.error(message)
      return { success: false, error: message }
    }
  })
}

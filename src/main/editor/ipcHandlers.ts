import { ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { LoadedFile, InitialEditorData, ChangedFile } from '../../shared/shared-types'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { moveFileToTrash } from '../utils/crud'
import { getEditorWindow } from './editorWindow'
import { datalogs, appState } from '../core/app-state/state'
import logger from '../core/logger'

export function setupEditorIpcHandlers(): void {
  // Handle fetching initial data

  ipcMain.handle('initial-editor-data', async (): Promise<InitialEditorData> => {
    try {
      const loadedDatalogs = Array.from(datalogs().values())
      const { rootPath, activeProjectPath: projectPath, activeProject } = appState

      if (!activeProject) throw Error('No active project')

      const initialData: InitialEditorData = {
        rootPath,
        projectPath,
        activeProject,
        loadedDatalogs
      }
      return initialData
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      logger.error(`Failed to fetch initial editor data: ${message}`)
      throw new Error('Failed to fetch initial editor data')
    }
  })

  ipcMain.on('show-editor-window', () => {
    const editor = getEditorWindow()
    editor?.show()
  })

  // Handle reading a file
  ipcMain.on('request-read-file', async (event, file: TemplateDirectoryFile) => {
    try {
      const ext = path.extname(file.path).toLowerCase()
      const content = await fs.readFile(file.path, 'utf8')
      const filetype = ext === '.jsx' ? 'jsx' : ext === '.tsx' ? 'tsx' : undefined

      if (!filetype) {
        throw new Error('Unsupported file type')
      }

      const loadedFile: LoadedFile = {
        ...file,
        content,
        filetype
      }
      event.sender.send('response-read-file', loadedFile)
    } catch (error) {
      event.sender.send('response-read-file', { error: (error as Error).message })
    }
  })

  // Handle saving a file
  ipcMain.handle('save-new-file', async (_, file: ChangedFile) => {
    try {
      logger.debug('save-new-file operation started')

      const dir = path.dirname(file.path)
      console.log(file.path)

      // Ensure the directory exists. If it doesn't, create it recursively.
      await fs.mkdir(dir, { recursive: true })

      try {
        // Check if the file already exists
        await fs.access(file.path)
        // If no error is thrown, the file exists
        throw new Error('File already exists')
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          // If the error is something other than "file does not exist", rethrow it
          throw error
        }
        // If the file does not exist, proceed to create it
      }
      // Write the file since it doesn't exist
      await fs.writeFile(file.path, file.content, 'utf8')
      logger.debug(`saved file ${file.path}`)

      return { success: true }
    } catch (error) {
      logger.error(`save-new-file operation failed: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('save-files', async (__dirname, files: ChangedFile[]) => {
    try {
      await Promise.all(
        files.map(async (file) => {
          fs.writeFile(file.path, file.content, 'utf-8')
        })
      )
      return
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Failed to save files: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  // Handle deleting a file
  ipcMain.handle('delete-file', async (_event, file: TemplateDirectoryFile) => {
    return moveFileToTrash(file.path)
  })
}

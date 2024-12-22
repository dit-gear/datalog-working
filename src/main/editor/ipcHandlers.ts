import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { LoadedFile, InitialEditorData } from '../../shared/shared-types'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { moveFileToTrash } from '../utils/crud'
import { getEditorWindow } from './editorWindow'
import {
  getActiveProjectPath,
  getAppPath,
  getActiveProject,
  datalogs
} from '../core/app-state/state'
import logger from '../core/logger'

export function setupEditorIpcHandlers(): void {
  // Handle fetching initial data

  ipcMain.handle('initial-editor-data', async (): Promise<InitialEditorData> => {
    try {
      const loadedDatalogs = Array.from(datalogs().values())
      const rootPath = getAppPath()
      const projectPath = getActiveProjectPath()
      const activeProject = getActiveProject()

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
  ipcMain.on('request-read-file', (event, file: TemplateDirectoryFile) => {
    try {
      const ext = path.extname(file.path).toLowerCase()
      const content = fs.readFileSync(file.path, 'utf8')
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
  ipcMain.handle('save-file', async (_, file: LoadedFile) => {
    try {
      if (file.isNewFile && fs.existsSync(file.path)) {
        throw new Error('File already exists')
      }
      fs.writeFileSync(file.path, file.content, 'utf8')
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // Handle deleting a file
  ipcMain.handle('delete-file', async (_event, file: TemplateDirectoryFile) => {
    return moveFileToTrash(file.path)
  })
}

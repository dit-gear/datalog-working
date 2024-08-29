import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { DirectoryFile, LoadedFile } from '../../shared/shared-types'
import { moveFileToTrash } from '../utils/crud'
import { getActiveProjectPath, getAppPath } from '../core/app-state/state'
import { sendInitialDirectories } from '../utils/editor-file-handler'

export function setupIpcHandlers(): void {
  // Handle fetching initial data
  ipcMain.handle('get-initial-data', () => {
    return sendInitialDirectories(getActiveProjectPath(), getAppPath())
  })

  // Handle reading a file
  ipcMain.on('request-read-file', (event, file: DirectoryFile) => {
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
  ipcMain.handle('save-file', async (event, file: LoadedFile) => {
    try {
      if (file.isNewFile && fs.existsSync(file.path)) {
        throw new Error('File already exists')
      }
      fs.writeFileSync(file.path, file.content, 'utf8')
      delete file.isNewFile
      event.sender.send('response-read-file', file)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // Handle deleting a file
  ipcMain.handle('delete-file', async (_event, file: DirectoryFile) => {
    return moveFileToTrash(file.path)
  })
}

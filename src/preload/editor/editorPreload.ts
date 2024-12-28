import { contextBridge, ipcRenderer } from 'electron'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { safeInvoke } from '@shared/utils/ipcUtils'
import { LoadedFile, InitialEditorData, ChangedFile } from '@shared/shared-types'

const editorApi = {
  fetchInitialData: (): Promise<InitialEditorData> =>
    safeInvoke<InitialEditorData>('initial-editor-data'),
  showWindow: (): void => {
    ipcRenderer.send('show-editor-window')
  },
  onDirChanged: (callback) => ipcRenderer.on('directory-changed', callback),
  requestReadFile: (file: TemplateDirectoryFile) => ipcRenderer.send('request-read-file', file),
  onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) =>
    ipcRenderer.on('response-read-file', (_, file) => callback(file)),
  saveNewFile: (file: ChangedFile) => ipcRenderer.invoke('save-new-file', file),
  saveFiles: (files: ChangedFile[]) => ipcRenderer.invoke('save-files', files),
  deleteFile: (file: TemplateDirectoryFile) => ipcRenderer.invoke('delete-file', file)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('editorApi', editorApi)
  } catch (error) {
    console.error(error)
  }
}

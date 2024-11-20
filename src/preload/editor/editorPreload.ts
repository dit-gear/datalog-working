import { contextBridge, ipcRenderer } from 'electron'
import { ProjectRootType, TemplateDirectoryFile } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'
import { LoadedFile } from '@shared/shared-types'

const editorApi = {
  initEditorWindow: (
    callback: (data: { project: ProjectRootType | null; datalogs: DatalogType[] }) => void
  ) =>
    ipcRenderer.on(
      'init-editor-window',
      (_, data: { project: ProjectRootType | null; datalogs: DatalogType[] }) => {
        callback(data)
      }
    ),
  onDirChanged: (callback) => ipcRenderer.on('directory-changed', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  requestReadFile: (file: TemplateDirectoryFile) => ipcRenderer.send('request-read-file', file),
  onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) =>
    ipcRenderer.on('response-read-file', (_, file) => callback(file)),
  saveFile: (file: LoadedFile) => ipcRenderer.invoke('save-file', file),
  deleteFile: (file: TemplateDirectoryFile) => ipcRenderer.invoke('delete-file', file)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('editorApi', editorApi)
  } catch (error) {
    console.error(error)
  }
}

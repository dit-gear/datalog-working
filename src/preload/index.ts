import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { LoadedFile, DirectoryFile, OpenModalTypes } from '../shared/shared-types'
import { DatalogType } from '@shared/datalogTypes'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      onRootPathChanged: (callback) =>
        ipcRenderer.on('root-path-changed', (_, dirFolderPath) => {
          callback(dirFolderPath)
        }),
      onProjectLoaded: (callback) =>
        ipcRenderer.on('project-loaded', (_, project) => {
          callback(project)
        }),
      onNewProjectClicked: (callback) => ipcRenderer.on('new-project', callback),
      onNewShootingDayClicked: (callback: () => void) =>
        ipcRenderer.on('new-shooting-day', () => callback()),
      onOpenModalInDatalog: (callback: (modal: OpenModalTypes) => void) =>
        ipcRenderer.on('open-modal-datalogWindow', (_, modal: OpenModalTypes) => {
          callback(modal)
        }),
      createNewProject: (projectName) => ipcRenderer.invoke('create-new-project', projectName),
      updateProject: (project) => ipcRenderer.invoke('update-project', project),
      getFolderPath: () => ipcRenderer.invoke('getFolderPath'),
      updateDatalog: (datalog: DatalogType) => ipcRenderer.invoke('update-datalog', datalog),
      deleteDatalog: (datalog: DatalogType) => ipcRenderer.invoke('delete-datalog', datalog),
      loadDatalogs: () => ipcRenderer.invoke('load-datalogs'),
      generatePdf: (docDefinition, filepath) =>
        ipcRenderer.send('generate-pdf', docDefinition, filepath),
      onPdfGenerated: (callback) => ipcRenderer.on('pdf-generated', callback),
      removePdfGeneratedListener: (callback) =>
        ipcRenderer.removeListener('pdf-generated', callback),
      findOcf: () => ipcRenderer.invoke('findOcf'),
      removeLogPath: (paths: string[]) => ipcRenderer.invoke('removeLogPath', paths),
      showProgressListener: (callback) => {
        const handler = (event, show, progress) => callback(show, progress)
        ipcRenderer.on('show-progress', handler)
        return () => ipcRenderer.removeListener('show-progress', handler)
      },
      getProxies: () => ipcRenderer.invoke('getProxies'),
      removeProxies: () => ipcRenderer.invoke('removeProxies'),
      getCsvMetadata: () => ipcRenderer.invoke('getCsvMetadata'),
      getInitialDir: () => ipcRenderer.invoke('get-initial-data'),
      onDirChanged: (callback) => ipcRenderer.on('directory-changed', callback),
      removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
      requestReadFile: (file: DirectoryFile) => ipcRenderer.send('request-read-file', file),
      onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) =>
        ipcRenderer.on('response-read-file', (_, file) => callback(file)),
      saveFile: (file: LoadedFile) => ipcRenderer.invoke('save-file', file),
      deleteFile: (file: DirectoryFile) => ipcRenderer.invoke('delete-file', file)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

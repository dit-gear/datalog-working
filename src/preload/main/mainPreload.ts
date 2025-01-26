import { contextBridge, ipcRenderer } from 'electron'
import { OpenModalTypes } from '../../shared/shared-types'
import { DatalogType } from '@shared/datalogTypes'
import { pdfType } from '@shared/projectTypes'

// Custom APIs for renderer
const mainApi = {
  onRootPathChanged: (callback) =>
    ipcRenderer.on('root-path-changed', (_, dirFolderPath) => {
      callback(dirFolderPath)
    }),
  onProjectLoaded: (callback) =>
    ipcRenderer.on('project-loaded', (_, project) => {
      callback(project)
    }),
  onOpenModalInDatalog: (callback: (modal: OpenModalTypes) => void) =>
    ipcRenderer.on('open-modal-datalogWindow', (_, modal: OpenModalTypes) => {
      callback(modal)
    }),
  createNewProject: (projectName) => ipcRenderer.invoke('create-new-project', projectName),
  updateProject: (project) => ipcRenderer.invoke('update-project', project),
  getFolderPath: () => ipcRenderer.invoke('getFolderPath'),
  updateDatalog: (datalog: DatalogType, isNew: boolean) =>
    ipcRenderer.invoke('update-datalog', datalog, isNew),
  deleteDatalog: (datalog: DatalogType) => ipcRenderer.invoke('delete-datalog', datalog),
  onDatalogsLoaded: (callback: (datalogs: DatalogType[]) => void) => {
    ipcRenderer.on('datalogs-loaded', (_, datalogs: DatalogType[]) => {
      callback(datalogs)
    })
  },
  getDefaultClips: (paths: {
    ocf: string[] | null
    sound: string[] | null
    proxy: string | null
  }) => ipcRenderer.invoke('getDefaultClips', paths),
  getClips: (type: 'ocf' | 'sound' | 'proxy' | 'custom') => ipcRenderer.invoke('getClips', type),
  removeClips: (paths: string[], type: 'ocf' | 'sound') =>
    ipcRenderer.invoke('removeClips', paths, type),
  clearClipsStore: () => ipcRenderer.invoke('clear-clips-store'),
  showProgressListener: (callback) => {
    const handler = (_, show, progress) => callback(show, progress)
    ipcRenderer.on('show-progress', handler)
    return () => ipcRenderer.removeListener('show-progress', handler)
  },
  openSendWindow: (selection?: DatalogType[]) => ipcRenderer.send('open-send-window', selection),
  exportPdf: (pdf: pdfType, selection?: DatalogType[]) =>
    ipcRenderer.send('pdf-to-export', pdf, selection)
}

const sharedApi = {
  onShowOverwriteConfirmation: (callback: (file: string) => void) => {
    ipcRenderer.on('show-overwrite-confirmation', (_, file: string) => {
      callback(file)
    })
  },

  // Send overwrite response
  sendOverwriteResponse: (shouldOverwrite: boolean) => {
    ipcRenderer.send('overwrite-response', shouldOverwrite)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('mainApi', mainApi)
    contextBridge.exposeInMainWorld('sharedApi', sharedApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  //window.electron = electronAPI
  // @ts-ignore (define in dts)
  //window.mainApi = api
}

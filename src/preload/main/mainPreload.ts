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
  updateDatalog: (datalog: DatalogType) => ipcRenderer.invoke('update-datalog', datalog),
  deleteDatalog: (datalog: DatalogType) => ipcRenderer.invoke('delete-datalog', datalog),
  onDatalogsLoaded: (callback: (datalogs: DatalogType[]) => void) => {
    ipcRenderer.on('datalogs-loaded', (_, datalogs: DatalogType[]) => {
      callback(datalogs)
    })
  },
  findOcf: () => ipcRenderer.invoke('findOcf'),
  removeLogPath: (paths: string[]) => ipcRenderer.invoke('removeLogPath', paths),
  showProgressListener: (callback) => {
    const handler = (_, show, progress) => callback(show, progress)
    ipcRenderer.on('show-progress', handler)
    return () => ipcRenderer.removeListener('show-progress', handler)
  },
  getProxies: () => ipcRenderer.invoke('getProxies'),
  removeProxies: () => ipcRenderer.invoke('removeProxies'),
  getCsvMetadata: () => ipcRenderer.invoke('getCsvMetadata'),
  openSendWindow: (selection?: DatalogType[]) => ipcRenderer.send('open-send-window', selection),
  exportPdf: (pdf: pdfType, selection?: DatalogType[]) =>
    ipcRenderer.send('pdf-to-export', pdf, selection)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('mainApi', mainApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  //window.electron = electronAPI
  // @ts-ignore (define in dts)
  //window.mainApi = api
}

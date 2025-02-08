import { contextBridge, ipcRenderer } from 'electron'
import { DatalogType, OcfClipType, SoundClipType } from '@shared/datalogTypes'
import { pdfType, ProjectType } from '@shared/projectTypes'

// Custom APIs for renderer
const mainApi = {
  getInitialRoute: () => ipcRenderer.invoke('get-route'),
  showDatalogWindow: (): void => ipcRenderer.send('show-datalog'),
  getProject: () => ipcRenderer.invoke('get-project'),
  getDatalogs: () => ipcRenderer.invoke('get-datalogs'),

  //load project
  onProjectLoaded: (callback: (project: ProjectType) => void) => {
    const handler = (_event, project: ProjectType) => callback(project)
    ipcRenderer.on('project-loaded', handler)
    return handler
  },
  offProjectLoaded: (handler: (event: Electron.IpcRendererEvent, project: ProjectType) => void) => {
    ipcRenderer.removeListener('project-loaded', handler)
  },
  createNewProject: (projectName: string) => ipcRenderer.invoke('create-new-project', projectName),
  updateProject: (project) => ipcRenderer.invoke('update-project', project),
  getFolderPath: () => ipcRenderer.invoke('getFolderPath'),
  updateDatalog: (datalog: DatalogType, isNew: boolean) =>
    ipcRenderer.invoke('update-datalog', datalog, isNew),
  deleteDatalog: (datalog: DatalogType) => ipcRenderer.invoke('delete-datalog', datalog),

  // load datalogs
  onDatalogsLoaded: (callback: (datalogs: DatalogType[]) => void) => {
    const handler = (_event, datalogs: DatalogType[]) => callback(datalogs)
    ipcRenderer.on('datalogs-loaded', handler)
    return handler
  },
  offDatalogsLoaded: (
    handler: (event: Electron.IpcRendererEvent, datalogs: DatalogType[]) => void
  ) => {
    ipcRenderer.removeListener('datalogs-loaded', handler)
  },
  checkDefaultPaths: (paths: {
    ocf: string[] | null
    sound: string[] | null
    proxy: string | null
  }) => ipcRenderer.invoke('checkPaths', paths),
  getDefaultClips: (paths: {
    ocf: string[] | null
    sound: string[] | null
    proxy: string | null
  }) => ipcRenderer.invoke('getDefaultClips', paths),
  getClips: (
    type: 'ocf' | 'sound' | 'proxy' | 'custom',
    storedClips: OcfClipType[] | SoundClipType[]
  ) => ipcRenderer.invoke('getClips', type, storedClips),
  removeClips: (
    paths: string[],
    type: 'ocf' | 'sound',
    storedClips: OcfClipType[] | SoundClipType[]
  ) => ipcRenderer.invoke('removeClips', paths, type, storedClips),
  openSendWindow: (selection?: DatalogType | DatalogType[]) =>
    ipcRenderer.send('open-send-window', selection),

  openBuilder: (callback: () => void) => ipcRenderer.on('open-builder', () => callback()),
  removeOpenBuilder: (callback: () => void) => {
    ipcRenderer.removeListener('open-builder', callback)
  },
  openSettings: (callback: () => void) => ipcRenderer.on('open-settings', () => callback()),
  removeOpenSettings: (callback: () => void) => {
    ipcRenderer.removeListener('open-settings', callback)
  },
  openNewProject: (callback: () => void) => ipcRenderer.on('open-new-project', () => callback()),
  removeOpenNewProject: (callback: () => void) => {
    ipcRenderer.removeListener('open-new-project', callback)
  },

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

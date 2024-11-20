import { contextBridge, ipcRenderer } from 'electron'
import { ProjectRootType } from '@shared/projectTypes'

const sendApi = {
  initSendWindow: (callback: (project: ProjectRootType | null) => void) =>
    ipcRenderer.on('init-sendwindow', (_, project: ProjectRootType | null) => {
      callback(project)
    }),
  openSendWindow: () => ipcRenderer.send('open-send-window'),
  closeSendWindow: () => ipcRenderer.send('close-send-window'),
  getFileContent: (filePath: string): Promise<string> =>
    ipcRenderer.invoke('get-file-content', filePath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('send', sendApi)
  } catch (error) {
    console.error(error)
  }
}

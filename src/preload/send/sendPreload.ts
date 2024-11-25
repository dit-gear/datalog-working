import { contextBridge, ipcRenderer } from 'electron'
import { InitialSendData } from '@shared/shared-types'
import { safeInvoke } from '@shared/utils/ipcUtils'

const sendApi = {
  fetchInitialData: (): Promise<InitialSendData> =>
    safeInvoke<InitialSendData>('initial-send-data'),
  showWindow: (): void => {
    ipcRenderer.send('show-send-window')
  },
  closeSendWindow: () => ipcRenderer.send('close-send-window'),
  getFileContent: (filePath: string): Promise<string> =>
    ipcRenderer.invoke('get-file-content', filePath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('sendApi', sendApi)
  } catch (error) {
    console.error(error)
  }
}

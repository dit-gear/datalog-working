import { contextBridge, ipcRenderer } from 'electron'
import { InitialSendData } from '@shared/shared-types'
import { safeInvoke } from '@shared/utils/ipcUtils'
import { emailType } from '@shared/projectTypes'

const sendApi = {
  fetchInitialData: (): Promise<InitialSendData> =>
    safeInvoke<InitialSendData>('initial-send-data'),
  showWindow: (): void => {
    ipcRenderer.send('show-send-window')
  },
  closeSendWindow: () => ipcRenderer.send('close-send-window'),
  getFileContent: (filePath: string): Promise<string> =>
    ipcRenderer.invoke('get-file-content', filePath),
  getMultipleFileContent: (filePaths: string[]): Promise<Record<string, string>> =>
    ipcRenderer.invoke('get-multiple-file-contents', filePaths),
  sendEmail: (email: emailType): Promise<boolean> =>
    safeInvoke<boolean>('incoming-send-email-request', email)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('sendApi', sendApi)
  } catch (error) {
    console.error(error)
  }
}

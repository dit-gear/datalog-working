import { contextBridge, ipcRenderer } from 'electron'
import { InitialSendData, Response } from '@shared/shared-types'
import { safeInvoke } from '@shared/utils/ipcUtils'
import { emailType } from '@shared/projectTypes'
import { sharedApi } from '../main/mainPreload'

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
  sendEmail: (email: emailType): Promise<Response> =>
    safeInvoke<Response>('incoming-send-email-request', email)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('sendApi', sendApi)
    contextBridge.exposeInMainWorld('sharedApi', sharedApi)
  } catch (error) {
    console.error(error)
  }
}

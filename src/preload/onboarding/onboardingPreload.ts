import { contextBridge, ipcRenderer } from 'electron'

const onboardApi = {
  finishOnboarding: (): void => ipcRenderer.send('OnboardClose_NewProj')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('onboardApi', onboardApi)
  } catch (error) {
    console.error(error)
  }
}

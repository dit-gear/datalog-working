import { InitialSendData } from '@shared/shared-types'

declare global {
  interface Window {
    sendApi: {
      fetchInitialData: () => Promise<InitialSendData>
      showWindow: () => void
      closeSendWindow: () => void
      getFileContent: (filePath: string) => Promise<string>
    }
  }
}

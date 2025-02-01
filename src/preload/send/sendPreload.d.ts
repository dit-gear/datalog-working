import { emailType } from '@shared/projectTypes'
import { InitialSendData, Response } from '@shared/shared-types'

declare global {
  interface Window {
    sendApi: {
      fetchInitialData: () => Promise<InitialSendData>
      showWindow: () => void
      closeSendWindow: () => void
      getFileContent: (filePath: string) => Promise<string>
      getMultipleFileContent: (filePaths: string[]) => Promise<Record<string, string>>
      sendEmail: (email: emailType) => Promise<Response>
    }
  }
}

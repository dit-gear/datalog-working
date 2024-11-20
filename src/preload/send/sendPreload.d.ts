import { ProjectRootType } from '@shared/projectTypes'

declare global {
  interface Window {
    send: {
      initSendWindow: (callback: (project: ProjectRootType | null) => void) => void
      openSendWindow: () => void
      closeSendWindow: () => void
      getFileContent: (filePath: string) => Promise<string>
    }
  }
}

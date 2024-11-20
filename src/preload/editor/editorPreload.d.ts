import { ProjectRootType, TemplateDirectoryFile } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'
import { LoadedFile, Response } from '@shared/shared-types'

declare global {
  interface Window {
    editorApi: {
      initEditorWindow: (
        callback: (data: { project: ProjectRootType | null; datalogs: DatalogType[] }) => void
      ) => void
      onDirChanged: (
        callback: (event: Electron.IpcRendererEvent, files: TemplateDirectoryFile[]) => void
      ) => void
      removeAllListeners: (channel: string) => void
      requestReadFile: (file: TemplateDirectoryFile) => void
      onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) => void
      saveFile: (file: LoadedFile) => Promise<Response>
      deleteFile: (file: TemplateDirectoryFile) => Promise<Response>
    }
  }
}

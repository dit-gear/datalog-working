import { ProjectRootType, TemplateDirectoryFile } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'
import { InitialEditorData, LoadedFile, Response, ChangedFile } from '@shared/shared-types'

declare global {
  interface Window {
    editorApi: {
      fetchInitialData: () => Promise<InitialEditorData>
      showWindow: () => void
      onDirChanged: (callback: (files: TemplateDirectoryFile[]) => void) => void
      onMockdataChanged: (callback: (data: string) => void) => void
      requestReadFile: (file: TemplateDirectoryFile) => void
      onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) => void
      saveNewFile: (file: ChangedFile) => Promise<Response>
      saveFiles: (files: ChangedFile[]) => Promise<Response>
      deleteFile: (file: TemplateDirectoryFile) => Promise<Response>
    }
  }
}

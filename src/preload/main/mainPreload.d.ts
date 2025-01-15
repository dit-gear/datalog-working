import {
  ProjectType,
  ProjectToUpdate,
  UpdateProjectResult,
  CreateNewProjectResult,
  Response,
  ResponseWithString,
  OpenModalTypes
} from '@shared/shared-types'
import { DatalogType, ResponseWithClips } from '@shared/datalogTypes'
import { TemplateDirectoryFile, pdfType } from '@shared/projectTypes'

declare global {
  interface Window {
    mainApi: {
      onRootPathChanged: (callback: (dirFolderPath: string) => void) => void
      onOpenModalInDatalog: (callback: (modal: OpenModalTypes) => void) => void
      createNewProject: (projectName: string) => Promise<CreateNewProjectResult>
      onProjectLoaded: (callback: (project: ProjectType) => void) => void
      updateProject: (project: ProjectToUpdate) => Promise<UpdateProjectResult>
      getFolderPath: () => Promise<ResponseWithString>
      updateDatalog: (datalog: DatalogType) => Promise<Response>
      deleteDatalog: (datalog: DatalogType) => Promise<Response>
      onDatalogsLoaded: (callback: (datalogs: DatalogType[]) => void) => void
      getClips: (type: 'ocf' | 'sound' | 'proxy' | 'custom') => Promise<ResponseWithClips>
      removeClips: (paths: string[], type: 'ocf' | 'sound') => Promise<ResponseWithClips>
      showProgress: (show: boolean, progress: number) => void
      showProgressListener: (callback: (show: boolean, progress: number) => void) => () => void
      onDirectoryLoaded: (
        callback: (event: Electron.IpcRendererEvent, files: TemplateDirectoryFile[]) => void
      ) => void
      openSendWindow: (selection?: DatalogType[]) => void
      exportPdf: (pdf: pdfType, selection?: DatalogType[]) => void
    }
  }
}

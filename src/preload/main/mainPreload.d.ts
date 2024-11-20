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
import { TemplateDirectoryFile } from '@shared/projectTypes'

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
      findOcf: () => Promise<ResponseWithClips>
      removeLogPath: (paths: string[]) => Promise<ResponseWithClips>
      showProgress: (show: boolean, progress: number) => void
      showProgressListener: (callback: (show: boolean, progress: number) => void) => () => void
      getProxies: () => Promise<ResponseWithClips>
      removeProxies: () => Promise<ResponseWithClips>
      getCsvMetadata: () => Promise<ResponseWithClips>
      onDirectoryLoaded: (
        callback: (event: Electron.IpcRendererEvent, files: TemplateDirectoryFile[]) => void
      ) => void
    }
  }
}

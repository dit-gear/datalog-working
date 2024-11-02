import { ElectronAPI } from '@electron-toolkit/preload'
import {
  ProjectType,
  ProjectToUpdate,
  UpdateProjectResult,
  CreateNewProjectResult,
  OfflineFolderType,
  CopyDestination,
  InitialDir,
  DirectoryFile,
  LoadedFile,
  Response,
  ResponseWithString,
  OpenModalTypes
} from '@shared/shared-types'
import {
  ClipType,
  DatalogType,
  ResponseWithClips,
  ResponseWithDatalogs
} from '@shared/datalogTypes'
import { ProjectRootType } from '@shared/projectTypes'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onRootPathChanged: (callback: (dirFolderPath: string) => void) => void
      onOpenModalInDatalog: (callback: (modal: OpenModalTypes) => void) => void
      createNewProject: (projectName: string) => Promise<CreateNewProjectResult>
      onProjectLoaded: (callback: (project: ProjectType) => void) => void
      updateProject: (project: ProjectToUpdate) => Promise<UpdateProjectResult>
      getFolderPath: () => Promise<ResponseWithString>
      updateDatalog: (datalog: DatalogType) => Promise<Response>
      deleteDatalog: (datalog: DatalogType) => Promise<Response>
      loadDatalogs: () => Promise<ResponseWithDatalogs>
      findOcf: () => Promise<ResponseWithClips>
      removeLogPath: (paths: string[]) => Promise<ResponseWithClips>
      showProgress: (show: boolean, progress: number) => void
      showProgressListener: (callback: (show: boolean, progress: number) => void) => () => void
      getProxies: () => Promise<ResponseWithClips>
      removeProxies: () => Promise<ResponseWithClips>
      getCsvMetadata: () => Promise<ResponseWithClips>
      onDirectoryLoaded: (
        callback: (event: Electron.IpcRendererEvent, files: DirectoryFile[]) => void
      ) => void
      getInitialDir: () => Promise<InitialDir>
      onDirChanged: (
        callback: (event: Electron.IpcRendererEvent, files: DirectoryFile[]) => void
      ) => void
      removeAllListeners: (channel: string) => void
      requestReadFile: (file: DirectoryFile) => void
      onResponseReadFile: (callback: (file: LoadedFile | { error: string }) => void) => void
      saveFile: (file: LoadedFile) => Promise<Response>
      deleteFile: (file: DirectoryFile) => Promise<Response>
      initSendWindow: (callback: (project: ProjectRootType | null) => void) => void
    }
  }
}

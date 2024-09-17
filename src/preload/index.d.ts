import { ElectronAPI } from '@electron-toolkit/preload'
import {
  ProjectType,
  ProjectToUpdate,
  UpdateProjectResult,
  CreateNewProjectResult,
  saveEntryResult,
  OfflineFolderType,
  CopyDestination,
  InitialDir,
  DirectoryFile,
  LoadedFile,
  Response,
  ResponseWithString
} from '@shared/shared-types'
import { ClipType, ResponseWithClips } from '@shared/datalogTypes'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onRootPathChanged: (callback: (dirFolderPath: string) => void) => void
      onNewProjectClicked: (callback: (data: boolean) => void) => void
      createNewProject: (projectName: string) => Promise<CreateNewProjectResult>
      onProjectLoaded: (callback: (project: ProjectType) => void) => void
      updateProject: (project: ProjectToUpdate) => Promise<UpdateProjectResult>
      getFolderPath: () => Promise<ResponseWithString>
      saveEntry: (entry: entryType) => Promise<saveEntryResult>
      loadEntries: () => Promise<entryType[]>
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
    }
  }
}

import { ElectronAPI } from '@electron-toolkit/preload'
import {
  saveEntryResult,
  OfflineFolderType,
  CopyDestination,
  InitialDir,
  DirectoryFile,
  LoadedFile,
  Response
} from '@types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onRootPathChanged: (callback: (dirFolderPath: string) => void) => void
      onNewProjectClicked: (callback: (data: boolean) => void) => void
      createNewProject: (projectName: string) => Promise<CreateNewProjectResult>
      onProjectLoaded: (callback: (project: ProjectType) => void) => void
      saveEntry: (entry: entryType) => Promise<saveEntryResult>
      loadEntries: () => Promise<entryType[]>
      findOcf: () => Promise<CopyDestination>
      showProgress: (show: boolean, progress: number) => void
      showProgressListener: (callback: (show: boolean, progress: number) => void) => () => void
      getOfflineFolderDetails: () => Promise<OfflineFolderType>
      getDocumentsFolder: () => Promise<string>
      getFolderPath: () => Promise<string | null>
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

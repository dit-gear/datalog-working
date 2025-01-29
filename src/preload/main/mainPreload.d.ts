import {
  ProjectType,
  ProjectToUpdate,
  UpdateProjectResult,
  CreateNewProjectResult,
  Response,
  ResponseWithString,
  OpenModalTypes
} from '@shared/shared-types'
import { DatalogType, OcfClipType, ResponseWithClips, SoundClipType } from '@shared/datalogTypes'
import { TemplateDirectoryFile, pdfType } from '@shared/projectTypes'

declare global {
  interface Window {
    mainApi: {
      onRootPathChanged: (callback: (dirFolderPath: string) => void) => void
      onOpenModalInDatalog: (callback: (modal: OpenModalTypes) => void) => void
      createNewProject: (projectName: string) => Promise<CreateNewProjectResult>
      getProject: () => ProjectType
      getDatalogs: () => DatalogType[]
      onProjectLoaded: (callback: (project: ProjectType) => void) => void
      updateProject: (project: ProjectToUpdate) => Promise<UpdateProjectResult>
      getFolderPath: () => Promise<ResponseWithString>
      updateDatalog: (datalog: DatalogType, isNew: boolean) => Promise<Response>
      deleteDatalog: (datalog: DatalogType) => Promise<Response>
      onDatalogsLoaded: (callback: (datalogs: DatalogType[]) => void) => void
      getDefaultClips: (paths: {
        ocf: string[] | null
        sound: string[] | null
        proxy: string | null
      }) => Promise<ResponseWithClips>
      getClips: (
        type: 'ocf' | 'sound' | 'proxy' | 'custom',
        storedClips: OcfClipType[] | SoundClipType[]
      ) => Promise<ResponseWithClips>
      removeClips: (
        paths: string[],
        type: 'ocf' | 'sound',
        storedClips: OcfClipType[] | SoundClipType[]
      ) => Promise<ResponseWithClips>
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

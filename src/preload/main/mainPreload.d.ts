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
import { IpcRendererEvent } from 'electron'

declare global {
  interface Window {
    mainApi: {
      createNewProject: (projectName: string) => Promise<CreateNewProjectResult>
      getInitialRoute: () => Promise<string>
      showDatalogWindow: () => void
      getProject: () => ProjectType
      getDatalogs: () => DatalogType[]
      onProjectLoaded: (callback: (_, project: ProjectType) => void) => void
      offProjectLoaded: (handler: (_, project: ProjectType) => void) => void
      updateProject: (project: ProjectToUpdate) => Promise<UpdateProjectResult>
      getFolderPath: () => Promise<ResponseWithString>
      updateDatalog: (datalog: DatalogType, isNew: boolean) => Promise<Response>
      deleteDatalog: (datalog: DatalogType) => Promise<Response>
      onDatalogsLoaded: (callback: (_, datalogs: DatalogType[]) => void) => void
      offDatalogsLoaded: (handler: (_, datalogs: DatalogType[]) => void) => void
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
      openSendWindow: (selection?: DatalogType[]) => void
      openBuilder: (callback: () => void) => void
      removeOpenBuilder: (callback: () => void) => void
      openSettings: (callback: () => void) => void
      removeOpenSettings: (callback: () => void) => void
      openNewProject: (callback: () => void) => void
      removeOpenNewProject: (callback: () => void) => void
      exportPdf: (pdf: pdfType, selection?: DatalogType[]) => void
    }
    sharedApi: {
      onShowOverwriteConfirmation: (callback: (filePath: string) => void) => void
      sendOverwriteResponse: (shouldOverwrite: boolean) => void
    }
  }
}

import { TemplateDirectoryFile, ProjectRootType } from './projectTypes'
import { DatalogDynamicType } from './datalogTypes'

export type durationType = {
  hours: number
  minutes: number
  seconds: number
}

export type FileInfo = {
  filename: string
  size: number
}
export type OfflineFolderType = {
  folderPath: string
  folderSize: number
  files: FileInfo[]
}

export type saveEntryResult = {
  success: boolean
  message?: string
}

export type Path = {
  project: string
  global: string
}

export type LoadedFile = TemplateDirectoryFile & {
  content: string
  filetype: 'jsx' | 'tsx'
  isNewFile?: boolean
}

export type InitialDir = {
  dir: TemplateDirectoryFile[]
  path: Path
}

export type Response = { success: true } | { success: false; error: string }

export type ResponseWithString =
  | { success: true; data: string }
  | { success: false; error: string; cancelled?: boolean }

export type OpenModalTypes = 'new-project' | 'new-shooting-day' | 'project-settings'

export type InitialEditorData = {
  rootPath: string
  projectPath: string
  activeProject: ProjectRootType
  loadedDatalogs: DatalogDynamicType[]
}

export type InitialSendData = {
  project: ProjectRootType
  datalogs: DatalogDynamicType[]
}

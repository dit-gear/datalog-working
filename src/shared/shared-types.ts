import { TemplateDirectoryFile, ProjectRootType, emailType } from './projectTypes'
import { DatalogDynamicType } from './datalogTypes'

export type DurationType = {
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
}

export type ChangedFile = {
  path: string
  content: string
}

export type InitialDir = {
  dir: TemplateDirectoryFile[]
  path: Path
}

export type Response = { success: true } | { success: false; error: string; cancelled?: boolean }

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
  selectedEmail?: emailType
  project: ProjectRootType
  selection?: DatalogDynamicType | DatalogDynamicType[]
  datalogs: DatalogDynamicType[]
}

export type DataObjectType = {
  project: ProjectRootType
  selection: DatalogDynamicType | DatalogDynamicType[]
  all: DatalogDynamicType[]
}

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
  paths: {
    localshared: string
    project: string
  }
  project: ProjectRootType
  loadedDatalogs: DatalogDynamicType[]
}

export type InitialSendData = {
  selectedEmail: emailType | null
  project: ProjectRootType
  selection: DatalogDynamicType | DatalogDynamicType[]
  datalogs: DatalogDynamicType[]
}

export interface DefaultPathsInput {
  ocf: string[] | null
  sound: string[] | null
  proxy: string | null
}

export interface CheckResult {
  path: string
  available: boolean
}

export interface CheckPathsResult {
  ocf: CheckResult[] | null
  sound: CheckResult[] | null
  proxy: CheckResult | null
}

export type SponsorMessageType = {
  slotId: string
  sponsor: string
  text: string
  ctalabel: string | null
  ctalink: string | null
} | null

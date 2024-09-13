import { z } from 'zod'

export type durationType = {
  hours?: number
  minutes?: number
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

export type DirectoryFile = {
  path: string
  type: 'email' | 'pdf'
  scope: 'project' | 'global'
}

export type LoadedFile = DirectoryFile & {
  content: string
  filetype: 'jsx' | 'tsx'
  isNewFile?: boolean
}

export type InitialDir = {
  dir: DirectoryFile[]
  path: Path
}

export type Response = {
  success: boolean
  error?: string
}

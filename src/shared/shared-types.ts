import { TemplateDirectoryFile, ProjectRootType, emailType } from './projectTypes'
import { DatalogDynamicType } from './datalogTypes'
import { z } from 'zod'

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

const CtaSchema = z.object({
  label: z.string(),
  link: z.string()
})
const ContentSchema = z
  .object({
    header: z.string(),
    sponsor: z.string().nullable(),
    text: z.string(),
    cta: CtaSchema.nullable()
  })
  .nullable()

export const SponsorMessageSchema = z.object({
  slotId: z.string(),
  content: ContentSchema
})

export type SponsorMessageContentType = z.infer<typeof ContentSchema>
export type SponsorMessageType = z.infer<typeof SponsorMessageSchema>

export type SponsorMessageResponseType = {
  sessionId: string
  adCache: SponsorMessageType | null
  cachedViews: { slotId: string; views: number }[]
}

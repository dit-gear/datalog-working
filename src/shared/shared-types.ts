import { z } from 'zod'

export type DestinationData = {
  Clip: string
  Size: number
  Reel?: string
  Duration?: number
  Fps?: string
  Scene?: string
  Take?: string
}

export type DestinationDataArray = DestinationData & {
  Volume: string[]
}

const DestinationDataSchema = z.object({
  Clip: z.string(),
  Size: z.number()
})

export type DestinationExtended = DestinationData & {
  Volumes: string[][]
  Proxy: boolean
}
const DestinationExtendedSchema = DestinationDataSchema.extend({
  Volumes: z.array(z.array(z.string())),
  Proxy: z.boolean()
})

export type CopyDestination = {
  volume: string[]
  data: DestinationDataArray[]
}

export type metadataCsv = {
  Clip: string
  Duration: number
  Scene?: string
  Shot?: string
  Take?: string
  QC?: string
}

const metadataCsvSchema = z.object({
  Clip: z.string(),
  Reel: z.string().optional(),
  Duration: z.number().optional(),
  Fps: z.string().optional(),
  Scene: z.string().optional(),
  Shot: z.string().optional(),
  Take: z.string().optional(),
  QC: z.string().optional()
})

export type combinedType = DestinationExtended & metadataCsv

const combinedTypeSchema = DestinationExtendedSchema.merge(metadataCsvSchema)

export const entrySchema = z.object({
  Folder: z.string().min(1).max(50),
  Day: z
    .number({
      required_error: 'Day is required',
      invalid_type_error: 'Day is required'
    })
    .int()
    .gte(1, { message: 'Day must be greater than or equal to 1' })
    .lte(999, { message: 'Day must be below 999' }),
  Date: z.string().date(),
  Unit: z.string().optional(),
  Files: z.number().min(1),
  Size: z.number().min(1),
  Duration: z.number(),
  ProxySize: z.number(),
  Clips: z.array(combinedTypeSchema)
})

export type clipsType = z.infer<typeof combinedTypeSchema>

export type entryType = z.infer<typeof entrySchema>

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

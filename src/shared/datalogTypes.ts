import { z } from 'zod'
import { Field, ProjectRootType } from './projectTypes'
import { getDuration } from './utils/datalog-methods'

const Camera_MetadataZod = z.object({
  Camera_Model: z.string().optional(),
  Camera_Id: z.string().optional(),
  Reel: z.string().optional(),
  FPS: z.string().optional(),
  Sensor_FPS: z.string().optional(),
  Lens: z.string().optional(),
  Focal_Lenght: z.string().optional(),
  Resolution: z.string().optional(),
  Codec: z.string().optional(),
  Gamma: z.string().optional(),
  WB: z.string().optional(),
  Tint: z.string().optional(),
  LUT: z.string().optional()
})

const ProxyZod = z.object({
  Path: z.string(),
  Size: z.number().nonnegative().finite(),
  Format: z.string().optional(),
  Codec: z.string().optional(),
  Resolution: z.string().optional()
})

export const ClipZod = z
  .object({
    Clip: z.string(),
    Size: z.number(),
    Copies: z.array(
      z.object({
        Path: z.string(),
        Hash: z.string().nullable()
      })
    ),
    Duration: z.number().optional(),
    Image: z.string().optional(), // Not in use
    Proxy: ProxyZod.optional()
  })
  .extend(Camera_MetadataZod.shape)

export const Files = z.object({
  Files: z.number().int().nonnegative().finite().optional(),
  Size: z.number().nonnegative().finite().optional()
})

export const datalogZod = z.object({
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
  OCF: Files.optional(),
  Proxy: Files.optional(),
  Duration: z.number().optional(),
  Reels: z.array(z.string()).optional(),
  Copies: z.array(z.string()).optional(), // Move to within OCF
  Clips: z.array(ClipZod).optional()
})

export type FilesType = z.infer<typeof Files>
export type ClipType = z.infer<typeof ClipZod>
export type DatalogType = z.infer<typeof datalogZod>

export type ResponseWithClips =
  | { success: true; clips: ClipType[] }
  | { success: false; error: string; cancelled?: boolean }

export type ResponseWithDatalogs =
  | { success: true; datalogs: DatalogType[] }
  | { success: false; error: string }

export type ResponseWithDatalog =
  | { success: true; datalog: DatalogType }
  | { success: false; error: string }

// Dynamic fields on Clip

const preprocessNestedObjectToArray = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(preprocessNestedObjectToArray) // Recursively process nested arrays
  }
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data)
    if (keys.every((key) => /^\d+$/.test(key))) {
      // If all keys are numeric, convert to array
      return keys
        .map(Number)
        .sort((a, b) => a - b)
        .map((key) => (data as Record<string, unknown>)[key])
    }
  }
  return data // Return unchanged if no transformation is needed
}

const mapTypeToZod = (field: Field): z.ZodTypeAny | undefined => {
  switch (field.type) {
    case 'string':
      return z.string().optional()
    case 'list_of_strings':
      return z.array(z.string()).optional()
    case 'list_of_field_arrays':
      return z.array(z.preprocess(preprocessNestedObjectToArray, z.array(z.string()))).optional()
    case 'key-value_object':
      return z.record(z.string(), z.string().optional()).optional()
    case 'list_of_mapped_objects':
      const subfieldobjects: Record<string, z.ZodTypeAny> = {}
      const { subfields } = field
      subfields.forEach((subfield) => {
        subfieldobjects[subfield.value_key] = z.string().optional()
      })
      return z.array(z.object(subfieldobjects)).optional()
    default:
      return undefined
  }
}

const buildAdditionalFieldsSchema = (project: ProjectRootType) => {
  const additionalFields: Record<string, z.ZodTypeAny> = {}

  if (project.additional_parsing?.fields) {
    for (const field of project.additional_parsing.fields) {
      if (field.type === 'duration') {
        continue
      }
      const zodSchema = mapTypeToZod(field)

      if (zodSchema) {
        additionalFields[field.value_key] = zodSchema // Add only if schema is defined
      }
    }
  }

  return additionalFields
}

export const ClipDynamicZod = (project: ProjectRootType): z.ZodObject<any> => {
  const zodSchema = ClipZod.extend(buildAdditionalFieldsSchema(project))
  return zodSchema
}

function msToReadable(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  const milliseconds = ms % 1000

  return `${String(hours)}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`
}

function readableToMs(readable: string): number {
  const [time, ms = '0'] = readable.split('.')
  const [hours, minutes, seconds] = time.split(':').map(Number)
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + Number(ms.padEnd(3, '0'))
}

interface DatalogDynamicZodOptions {
  transformDurationToReadable?: boolean
  transformDurationToMs?: boolean
}

type DatalogZodShape = typeof datalogZod extends z.ZodObject<infer S> ? S : never

export const DatalogDynamicZod = <T extends Record<string, any>>(
  project: ProjectRootType | undefined,
  { transformDurationToReadable, transformDurationToMs }: DatalogDynamicZodOptions = {}
): z.ZodObject<z.ZodRawShape & T> => {
  let datalogBase = datalogZod as z.ZodObject<any>

  const getTransformedClipSchema = () => {
    let transformedClipZod = project ? ClipDynamicZod(project) : (ClipZod as z.ZodObject<any>)
    if (transformDurationToReadable) {
      transformedClipZod = transformedClipZod.omit({ Duration: true }).extend({
        Duration: z
          .number()
          .transform((val) => msToReadable(val))
          .optional()
      })
    } else if (transformDurationToMs) {
      transformedClipZod = transformedClipZod.omit({ Duration: true }).extend({
        Duration: z
          .string()
          .transform((val) => readableToMs(val))
          .optional()
      })
    }
    return transformedClipZod
  }

  // Apply duration transformations
  if (transformDurationToReadable) {
    datalogBase = datalogBase.omit({ Duration: true }).extend({
      Duration: z
        .number()
        .transform((val) => msToReadable(val))
        .optional()
    })
  } else if (transformDurationToMs) {
    datalogBase = datalogBase.omit({ Duration: true }).extend({
      Duration: z
        .string()
        .transform((val) => readableToMs(val))
        .optional()
    })
  }

  if (project) {
    const ClipSchema = getTransformedClipSchema()
    datalogBase = datalogBase.omit({ Clips: true }).extend({
      Clips: z.array(ClipSchema).optional()
    })
  }

  return datalogBase as z.ZodObject<z.ZodRawShape & T>
}

export type DatalogDynamicType = DatalogType & Record<string, any>

const reelsOptions = z.object({ grouped: z.boolean().optional() }).optional()

const DatalogClassZod = z.object({
  logName: z.string(),
  day: z.number(),
  date: z.string(),
  clips: z.array(ClipZod),
  ocf: z.object({
    filesCount: z.function().returns(z.number()),
    getSize: z.function().returns(z.string()),
    getCopies: z.function().returns(z.string())
  }),
  proxys: z.object({
    getFilesCount: z.function().args().returns(z.number()),
    getSize: z.function().returns(z.string())
  }),
  getDuration: z.function().returns(z.string()),
  getReels: z.function().args(reelsOptions).returns(z.array(z.string())),
  raw: datalogZod
})

export const DataClassZod = z.object({
  projectName: z.string(),
  datalog: DatalogClassZod,
  datalogs: z.array(DatalogClassZod),
  allDatalogs: z.array(DatalogClassZod),
  getTotalOCFSize: z.function().returns(z.string()),
  getTotalOCFFileCount: z.function().returns(z.number())
})

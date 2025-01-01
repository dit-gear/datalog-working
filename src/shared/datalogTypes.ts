import { z } from 'zod'
import { Field, ProjectRootType } from './projectTypes'

const Camera_MetadataZod = z.object({
  camera_model: z.string().optional(),
  camera_id: z.string().optional(),
  reel: z.string().optional(),
  fps: z.string().optional(),
  sensor_fps: z.string().optional(),
  lens: z.string().optional(),
  resolution: z.string().optional(),
  codec: z.string().optional(),
  gamma: z.string().optional(),
  wb: z.string().optional(),
  tint: z.string().optional(),
  lut: z.string().optional()
})

const ProxyZod = z.object({
  path: z.string(),
  size: z.number().nonnegative().finite(),
  format: z.string().optional(),
  codec: z.string().optional(),
  resolution: z.string().optional()
})

export const ClipZod = z
  .object({
    clip: z.string(),
    size: z.number(),
    copies: z.array(
      z.object({
        path: z.string(),
        hash: z.string().nullable()
      })
    ),
    duration: z.number().optional(),
    image: z.string().optional(), // Not in use
    proxy: ProxyZod.optional()
  })
  .extend(Camera_MetadataZod.shape)

export const Files = z.object({
  files: z.number().int().nonnegative().finite().optional(),
  size: z.number().nonnegative().finite().optional()
})

export const datalogZod = z.object({
  id: z.string().min(1).max(50),
  day: z
    .number({
      required_error: 'Day is required',
      invalid_type_error: 'Day is required'
    })
    .int()
    .gte(1, { message: 'Day must be greater than or equal to 1' })
    .lte(999, { message: 'Day must be below 999' }),
  date: z.string().date(),
  unit: z.string().optional(),
  ocf: Files.optional(),
  proxy: Files.optional(),
  duration: z.number().optional(),
  reels: z.array(z.string()).optional(),
  copies: z.array(z.string()).optional(), // Move to within OCF
  clips: z.array(ClipZod).optional()
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

  if (project.custom_fields?.fields) {
    for (const field of project.custom_fields.fields) {
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

//type DatalogZodShape = typeof datalogZod extends z.ZodObject<infer S> ? S : never

export const DatalogDynamicZod = <T extends Record<string, any>>(
  project: ProjectRootType | undefined,
  { transformDurationToReadable, transformDurationToMs }: DatalogDynamicZodOptions = {}
): z.ZodObject<z.ZodRawShape & T> => {
  let datalogBase = datalogZod as z.ZodObject<any>

  const getTransformedClipSchema = () => {
    let transformedClipZod = project ? ClipDynamicZod(project) : (ClipZod as z.ZodObject<any>)
    if (transformDurationToReadable) {
      transformedClipZod = transformedClipZod.omit({ Duration: true }).extend({
        duration: z
          .number()
          .transform((val) => msToReadable(val))
          .optional()
      })
    } else if (transformDurationToMs) {
      transformedClipZod = transformedClipZod.omit({ Duration: true }).extend({
        duration: z
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
      duration: z
        .number()
        .transform((val) => msToReadable(val))
        .optional()
    })
  } else if (transformDurationToMs) {
    datalogBase = datalogBase.omit({ Duration: true }).extend({
      duration: z
        .string()
        .transform((val) => readableToMs(val))
        .optional()
    })
  }

  if (project) {
    const ClipSchema = getTransformedClipSchema()
    datalogBase = datalogBase.omit({ Clips: true }).extend({
      clips: z.array(ClipSchema).optional()
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
    getfilesCount: z.function().returns(z.number()),
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
  datalogArray: z.array(DatalogClassZod),
  datalogs: z.array(DatalogClassZod),
  getTotalOCFSize: z.function().returns(z.string()),
  getTotalOCFFileCount: z.function().returns(z.number())
})

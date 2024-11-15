import { z } from 'zod'
import { Field, ProjectRootType } from './projectTypes'

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

const mapTypeToZod = (field: Field): z.ZodTypeAny | undefined => {
  switch (field.type) {
    case 'string':
      return z.string().optional()
    case 'list_of_strings':
      return z.array(z.string()).optional()
    case 'list_of_field_arrays':
      return z.array(z.array(z.string())).optional()
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

const reelsOptions = z.object({ grouped: z.boolean().optional() }).optional()

export type DatalogDynamicType = DatalogType & Record<string, any>
const datalogWithMethods = datalogZod.extend({
  getOCFFiles: z.function().returns(z.number()),
  getOCFSize: z.function().returns(z.number()),
  getProxyFiles: z.function().returns(z.number()),
  getProxySize: z.function().returns(z.number()),
  getDuration: z.function().returns(z.number()),
  getReels: z.function().args(reelsOptions).returns(z.array(z.string()))
})
export type DatalogWithMethods = z.infer<typeof datalogWithMethods>

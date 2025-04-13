import { z } from 'zod'
import { Field, ProjectRootType } from './projectTypes'
import { isValidTimecodeFormat, addTimecodeValidation } from './utils/format-timecode'

const timecode = z
  .string()
  .refine((val) => isValidTimecodeFormat(val), { message: 'Invalid timecode format' })

export const CameraMetadataZod = z.object({
  clip: z.string(),
  tc_start: timecode.optional(),
  tc_end: timecode.optional(),
  duration: timecode.optional(),
  camera_model: z.string().optional(),
  camera_id: z.string().optional(),
  reel: z.string().optional(),
  fps: z.coerce.number().optional(),
  sensor_fps: z.string().optional(),
  lens: z.string().optional(),
  resolution: z.string().optional(),
  codec: z.string().optional(),
  gamma: z.string().optional(),
  wb: z.string().optional(),
  tint: z.string().optional(),
  lut: z.string().optional()
})

export type CameraMetadataType = z.infer<typeof CameraMetadataZod>

const copy = z.object({
  volume: z.string(),
  hash: z.string().nullable()
})
const copies = z.array(copy)
export type CopyBaseType = z.infer<typeof copy>
const size = z.number().nonnegative().finite()

export type CopyType = {
  volumes: string[]
  clips: string[]
  count: [number, number]
}

const OcfClipBaseZod = z.object({
  clip: z.string(),
  size: size,
  copies: copies
})

export const OcfClipZod = addTimecodeValidation(OcfClipBaseZod.merge(CameraMetadataZod), [
  'tc_start',
  'tc_end',
  'duration'
])

export type OcfClipType = z.infer<typeof OcfClipZod>
export type OcfClipBaseType = z.infer<typeof OcfClipBaseZod>

export const SoundClipZod = addTimecodeValidation(
  z.object({
    clip: z.string(),
    size: size,
    copies: copies,
    tc_start: z.string().optional(),
    tc_end: z.string().optional()
  }),
  ['tc_start', 'tc_end']
)

export type SoundClipType = z.infer<typeof SoundClipZod>

export const ProxyClipZod = z.object({
  clip: z.string(),
  size: size,
  format: z.string().optional(),
  codec: z.string().optional(),
  resolution: z.string().optional()
})
export type ProxyClipType = z.infer<typeof ProxyClipZod>

const file = z.number().int().nonnegative().finite().optional()
const sizeOptional = z.optional(size)
const copiesarray = z.array(z.string()).optional()

export const Sound = z.object({
  files: file,
  size: sizeOptional,
  copies: copiesarray,
  clips: z.array(SoundClipZod).optional()
})
export type SoundType = z.infer<typeof Sound>

export const OCF = z.object({
  files: file,
  size: sizeOptional,
  duration: timecode.optional(),
  reels: z.array(z.string()).optional(),
  copies: copiesarray,
  clips: z.array(OcfClipZod).optional()
})
export type OcfType = z.infer<typeof OCF>

export const Proxy = z.object({
  files: file,
  size: sizeOptional,
  clips: z.array(ProxyClipZod).optional()
})
export type ProxyType = z.infer<typeof Proxy>

const Custom = z
  .object({
    clip: z.string()
  })
  .catchall(z.any())

export type CustomType = z.infer<typeof Custom>

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
  ocf: OCF.optional(),
  proxy: Proxy.optional(),
  sound: Sound.optional(),
  custom: z.array(Custom).optional()
})

export const datalogZodMerged = datalogZod.omit({ day: true }).extend({
  day: z.coerce.string({
    required_error: 'Day is required',
    invalid_type_error: 'Day is required'
  })
})

export type DatalogType = z.infer<typeof datalogZod>
export type DatalogTypeMerged = z.infer<typeof datalogZodMerged>

export type ResponseWithClips =
  | {
      success: true
      clips: { ocf?: OcfClipType[]; sound?: SoundClipType[]; proxy?: ProxyClipType[]; custom? }
    }
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

const buildCustomFieldsSchema = (project: ProjectRootType) => {
  const customFields: Record<string, z.ZodTypeAny> = {}

  if (project.custom_fields?.fields) {
    for (const field of project.custom_fields.fields) {
      /*if (field.type === 'duration') {
        continue
      }*/
      const zodSchema = mapTypeToZod(field)

      if (zodSchema) {
        customFields[field.value_key] = zodSchema // Add only if schema is defined
      }
    }
  }

  return customFields
}

export const CustomFieldsZod = (project: ProjectRootType): z.ZodObject<any> => {
  return z
    .object({
      clip: z.string()
    })
    .extend(buildCustomFieldsSchema(project))
}

export const DatalogDynamicZod = (project: ProjectRootType) => {
  return datalogZod
    .omit({ custom: true })
    .extend({ custom: z.array(CustomFieldsZod(project)).optional() })
}

const ClipZod = OcfClipBaseZod.merge(CameraMetadataZod).extend({
  sound: z.array(z.string()).optional(),
  proxy: ProxyClipZod.omit({ clip: true })
})

// for definitions
export const ClipDynamicZod = (project: ProjectRootType) => {
  return ClipZod.merge(CustomFieldsZod(project)).omit({ size: true, duration: true, proxy: true })
}

export type DatalogDynamicType = DatalogType

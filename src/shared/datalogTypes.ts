import { z } from 'zod'

const DestinationDataSchema = z.object({
  Clip: z.string(),
  Size: z.number(),
  Hash: z.string().nullable()
})

const DestinationExtendedSchema = DestinationDataSchema.extend({
  Copies: z.array(z.array(z.string()))
})

const Camera_Metadata = z.object({
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

const Clip = z
  .object({
    Clip: z.string(),
    Reel: z.string().optional(),
    Duration: z.number().optional(),
    Camera: Camera_Metadata.optional()
  })
  .catchall(z.string())

//const Clip = DestinationExtendedSchema.extend(metadataCsvSchema)

const Files = z.object({
  Files: z.number().int().nonnegative().finite(),
  Size: z.number().nonnegative().finite()
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
  Clips: z.array(Clip).optional()
})

export type datalogType = z.infer<typeof datalogZod>

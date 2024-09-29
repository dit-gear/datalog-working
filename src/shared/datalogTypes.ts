import { z } from 'zod'

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
    Image: z.string().optional(),
    Proxy: ProxyZod.optional()
  })
  .extend(Camera_MetadataZod.shape)
//.catchall(z.string())

export const Files = z.object({
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
  Copies: z.array(z.string()).optional(),
  Clips: z.array(ClipZod).optional()
})

export type FilesType = z.infer<typeof Files>
export type ClipType = z.infer<typeof ClipZod>
export type DatalogType = z.infer<typeof datalogZod>

export type ResponseWithClips =
  | { success: true; clips: ClipType[] }
  | { success: false; error: string; cancelled?: boolean }

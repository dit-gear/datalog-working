import { z } from 'zod'

const anyNestedString = z.lazy(() =>
  z
    .union([z.string(), z.record(z.string(), anyNestedString), z.array(anyNestedString), z.null()])
    .nullable()
    .optional()
)

const hashItemZod = z.object({
  file: z.string(),
  size: z.string().transform((v) => parseInt(v, 10)),
  lastmodificationdate: z.string(),
  md5: z.string().length(32).optional().nullable(),
  sha1: z.string().length(40).optional().nullable(),
  xxhash64: z.string().length(16).optional().nullable(),
  xxhash64be: z.string().length(16).optional().nullable(),
  null: z.string().optional().nullable(),
  hashdate: z.string().optional().nullable()
})

const hashListZod = z.object({
  creatorinfo: anyNestedString.optional(),
  hash: z.union([hashItemZod, z.array(hashItemZod)]),
  version: z.string()
})

export const mhlClassicZod = z.object({
  '?xml': z.object({
    version: z.string(),
    encoding: z.string()
  }),
  hashlist: hashListZod
})

export type classicRow = z.infer<typeof hashItemZod>
export type mhlClassicType = z.infer<typeof mhlClassicZod>

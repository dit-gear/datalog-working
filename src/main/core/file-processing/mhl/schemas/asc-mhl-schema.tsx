import { z } from 'zod'

const Action = z.enum(['original', 'verified', 'failed'])

const anyNestedString = z.lazy(() =>
  z
    .union([z.string(), z.record(z.string(), anyNestedString), z.array(anyNestedString), z.null()])
    .nullable()
    .optional()
)

// Define HashFormat type
const hashFormatZod = z.object({
  text: z.string(),
  action: Action.optional(),
  hashdate: z.string().optional(),
  structure: z.string().optional()
})

// Define Path type with attributes
const pathZod = z.object({
  text: z.string(),
  size: z.string().transform((v) => parseInt(v, 10)),
  creationdate: z.string().optional(),
  lastmodificationdate: z.string().optional()
})

// Define Hash type
const hashItemZod = z.object({
  path: pathZod,
  c4: hashFormatZod.optional(),
  md5: hashFormatZod.optional(),
  sha1: hashFormatZod.optional(),
  xxh128: hashFormatZod.optional(),
  xxh3: hashFormatZod.optional(),
  xxh64: hashFormatZod.optional(),
  xxh64be: hashFormatZod.optional(),
  previousPath: z.string().optional(),
  metadata: z.any().optional()
})

const hashesZod = z.object({
  hash: z.array(hashItemZod)
})

// Define HashList type with attribute
const hashListZod = z.object({
  version: z.string(),
  creatorinfo: anyNestedString.optional(),
  processinfo: anyNestedString.optional(),
  hashes: hashesZod,
  metadata: anyNestedString.optional(),
  references: anyNestedString.optional()
})

// Define root element schema
export const mhlAscZod = z.object({
  '?xml': z.object({
    version: z.string(),
    encoding: z.string()
  }),
  hashlist: hashListZod
})

export type ascRow = z.infer<typeof hashItemZod>
export type mhlAscType = z.infer<typeof mhlAscZod>

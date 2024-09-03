import { z } from 'zod'

// Define the schema for the MHL file START

const creatorInfoSchema = z.object({
  name: z.string(),
  username: z.string(),
  hostname: z.string(),
  tool: z.string(),
  startdate: z.string(),
  finishdate: z.string()
})

const hashItemSchema = z.object({
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

const hashListSchema = z.object({
  creatorinfo: creatorInfoSchema,
  hash: z.array(hashItemSchema),
  version: z.string()
})

export const mhlSchema = z.object({
  '?xml': z.object({
    version: z.string(),
    encoding: z.string()
  }),
  hashlist: hashListSchema
})
export type MHLtype = z.infer<typeof mhlSchema>

// Define the schema for the MHL file END

// Define the schema for the ASC MHL file START

// Define custom string types
const EmailAddress = z.string().email()
const RelativePath = z.string()

// Define Action enum
const Action = z.enum(['original', 'verified', 'failed'])

// Define HashFormat type
const HashFormat = z.object({
  text: z.string().optional(),
  action: Action.optional(),
  hashdate: z.string().optional(),
  structure: z.string().optional()
})

// Define DirectoryHashFormatContainer type
const DirectoryHashFormatContainer = z.object({
  c4: HashFormat.optional(),
  md5: HashFormat.optional(),
  sha1: HashFormat.optional(),
  xxh128: HashFormat.optional(),
  xxh3: HashFormat.optional(),
  xxh64: HashFormat.optional()
})

// Define Path type with attributes
const Path = z.object({
  text: z.string(),
  size: z.number(),
  creationdate: z.string().optional(),
  lastmodificationdate: z.string().optional()
})

//const ExtendedRelativePath = RelativePath.extend(Path);

// Define Hash type
const Hash = z.object({
  path: Path,
  c4: HashFormat.optional(),
  md5: HashFormat.optional(),
  sha1: HashFormat.optional(),
  xxh128: HashFormat.optional(),
  xxh3: HashFormat.optional(),
  xxh64: z.any().optional(),
  previousPath: RelativePath.optional(),
  metadata: z.any().optional()
})

// Define DirectoryHash type
const DirectoryHash = z.object({
  path: Path,
  content: DirectoryHashFormatContainer,
  structure: DirectoryHashFormatContainer,
  previousPath: RelativePath.optional(),
  metadata: z.any().optional()
})

// Define RootDirectoryHash type
const RootDirectoryHash = z.object({
  content: DirectoryHashFormatContainer,
  structure: DirectoryHashFormatContainer
})

// Define Ignore type
const Ignore = z.array(z.string())

// Define References type
const References = z.object({
  hashlistreference: z.array(
    z.object({
      path: RelativePath,
      c4: HashFormat
    })
  )
})

// Define CreatorInfo type
const CreatorInfo = z.object({
  creationdate: z.string(),
  hostname: z.string(),
  tool: z.any(),
  author: z.any(),
  location: z.string().optional(),
  comment: z.string().optional()
})

// Define ProcessInfo type
const ProcessInfo = z.object({
  process: z.enum(['in-place', 'transfer', 'flatten']),
  roothash: DirectoryHash.optional(),
  ignore: Ignore.optional()
})

const hashesSchema = z.object({
  hash: z.array(Hash)
})

// Define HashList type with attribute
const HashList = z.object({
  version: z.number(),
  creatorinfo: CreatorInfo,
  processinfo: z.any().optional(),
  hashes: hashesSchema,
  metadata: z.any().optional(),
  references: References.optional()
})

// Define root element schema
export const AscMhlschema = z.object({
  '?xml': z.object({
    version: z.number(),
    encoding: z.string()
  }),
  hashlist: HashList
})

// Define the schema for the ASC MHL file END

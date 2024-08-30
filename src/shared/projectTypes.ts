import z from 'zod'

const fieldType = z.enum(['string', 'array', 'object', 'duration'])

const options = z
  .object({
    type: fieldType,
    regex: z.string().optional(),
    unit: z.enum(['ms', 's', 'tc', 'frames']).optional(),
    fps: z.string().max(80).optional()
  })
  .optional()

const subfields = z.array(z.object({ name: z.string().min(1).max(80) })).optional()
const additionalParsing = z.object({
  clip: z.object({ field: z.string().min(1).max(80), regex: z.string().max(60).optional() }),
  fields: z
    .array(
      z
        .object({
          name: z.string().min(1).max(80),
          field: z.string().min(1).max(80),
          subfields: subfields,
          options: options
        })
        .superRefine((data, ctx) => {
          const { type } = data.options || {}
          if (type === 'object' && (!data.subfields || data.subfields.length === 0)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'At least one subfield is required when type is "object"',
              path: ['subfields']
            })
          }
          if (type === 'duration') {
            const unit = data.options?.unit
            if (!unit) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Unit is required when type is "duration"',
                path: ['options', 'unit']
              })
            }
            const fps = data.options?.fps
            if (unit === 'tc' || (unit === 'frames' && (!fps || fps.length < 1))) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'FPS is required when using "Timecode" or "Frames"',
                path: ['options', 'fps']
              })
            }
          }

          if (data.subfields) {
            const seenSubfieldNames = new Set<string>()
            data.subfields.forEach((subfield, subfieldIndex) => {
              if (seenSubfieldNames.has(subfield.name)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Key must be unique',
                  path: ['subfields', subfieldIndex, 'name']
                })
              } else {
                seenSubfieldNames.add(subfield.name)
              }
            })
          }
        })
    )
    .superRefine((fields, ctx) => {
      const reservedNames = ['clip', 'duration']
      const seenNames = new Set<string>(reservedNames)

      fields.forEach((field, index) => {
        if (seenNames.has(field.name)) {
          const message = reservedNames.includes(field.name.toLowerCase())
            ? `"${field.name}" is reserved and cannot be used.`
            : 'Key must be unique'
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: message,
            path: [index, 'name']
          })
        } else {
          seenNames.add(field.name)
        }
      })
    })
    .optional()
})

const emailSettings = z.object({
  service_provider: z.string(),
  api_key_encrypted: z.string()
})

export const emailZodObj = z.object({
  name: z.string(),
  show: z.object({ item: z.boolean(), root: z.boolean() }),
  sender: z.string().email().optional(),
  recipients: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  attatchments: z.array(z.string()).optional(),
  body: z.string().optional(),
  template: z.string() // url to file.
})

export const GlobalSchemaZod = z.object({
  folder_template: z.string(),
  unit: z.string().optional(),
  default_ocf_paths: z.array(z.string()).optional(),
  default_proxies_path: z.string().optional(),
  parse_camera_metadata: z.boolean().default(true).optional(),
  additional_parsing: additionalParsing.optional(),
  emails: z.array(emailZodObj).optional(),
  email_api: emailSettings.optional()
})

export const ProjectSchemaZod = z.object({
  project_name: z.string().min(1).max(80),
  ...GlobalSchemaZod.shape
})

const ProjectSettingsZod = z.object({
  project: ProjectSchemaZod,
  global: GlobalSchemaZod.optional()
})

export const ProjectRootZod = ProjectSchemaZod.merge(
  z.object({
    settings: ProjectSettingsZod
  })
)
export const GlobalSchemaZodNullable = GlobalSchemaZod.nullable()
export type fieldType = z.infer<typeof fieldType>
export type additionalParsing = z.infer<typeof additionalParsing>
export type ProjectSchemaType = z.infer<typeof ProjectSchemaZod>
export type ProjectRootType = z.infer<typeof ProjectRootZod>
export type ProjectSettingsType = z.infer<typeof ProjectSettingsZod>

export type ProjectType = {
  rootPath: string
  projectPath?: string
  data?: ProjectRootType
}

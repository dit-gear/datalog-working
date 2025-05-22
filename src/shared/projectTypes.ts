import z from 'zod'

const fieldType = z.enum([
  'string',
  'list_of_strings',
  'key-value_object',
  'list_of_field_arrays',
  'list_of_mapped_objects',
  'duration'
])

export const primitiveTypesZod = fieldType.exclude(['duration'])
export const specialTypesZod = fieldType.extract(['duration'])

export const delimiters = z.enum([',', ';', '|', ':', '='])

const fileNameRegex = /^[^<>:"/\\|?*\x00-\x1F]*$/

const reservedNames = ['settings', 'shared', 'templates']

const timeUnits = z.enum(['ms', 's', 'tc', 'frames'])
export type timeUnitsType = z.infer<typeof timeUnits>

function validateRegex(pattern: string, path: (string | number)[], ctx: z.RefinementCtx) {
  // 1. Check for Dangerous Constructs
  const dangerousPattern = /(.*\+.*\+|\*\*|\?\?)/
  if (dangerousPattern.test(pattern)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pattern contains dangerous constructs (e.g., nested quantifiers).',
      path: path
    })
  }

  // 2. Validate Regex Syntax
  try {
    new RegExp(pattern)
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid regular expression syntax.',
      path: path
    })
  }
}

const subfields = z.array(z.object({ value_key: z.string().min(1).max(80) })).nonempty()

const value_key = z.string().min(1).max(80)
const column = z.string().min(1).max(80)

const regex = z.string().max(100, 'Regex pattern is too long').optional()

const stringField = z.object({
  type: fieldType.extract(['string']),
  value_key,
  column,
  regex
})
const listOfStringsField = z.object({
  type: fieldType.extract(['list_of_strings']),
  value_key,
  column,
  delimiter: delimiters.optional()
})
const keyValueObjField = z.object({
  type: fieldType.extract(['key-value_object']),
  value_key,
  column,
  primary_delimiter: delimiters.optional(),
  secondary_delimiter: delimiters.optional()
})
const listOfFieldArraysField = z.object({
  type: fieldType.extract(['list_of_field_arrays']),
  value_key,
  column,
  primary_delimiter: delimiters.optional(),
  secondary_delimiter: delimiters.optional()
})
const listOfMappedObjectsField = z.object({
  type: fieldType.extract(['list_of_mapped_objects']),
  value_key,
  column,
  subfields,
  primary_delimiter: delimiters.optional(),
  secondary_delimiter: delimiters.optional()
})
const durationField = z.object({
  type: fieldType.extract(['duration']),
  // value_key: 'duration'
  column,
  unit: timeUnits,
  fps: z.string().max(80).optional()
})

export type StringFieldType = z.infer<typeof stringField>
export type ListOfStringsFieldType = z.infer<typeof listOfStringsField>
export type KeyValueObjFieldType = z.infer<typeof keyValueObjField>
export type ListOfFieldArraysFieldType = z.infer<typeof listOfFieldArraysField>
export type ListOfMappedObjectsFieldType = z.infer<typeof listOfMappedObjectsField>
export type DurationFieldType = z.infer<typeof durationField>

const field = z
  .discriminatedUnion('type', [
    stringField,
    listOfStringsField,
    keyValueObjField,
    listOfFieldArraysField,
    listOfMappedObjectsField
    //durationField
  ])
  .superRefine((data, ctx) => {
    if (data.type === 'string' && data.regex) {
      validateRegex(data.regex, ['regex'], ctx)
    }
    /*if (data.type === 'duration') {
      if (data.unit === 'tc' || (data.unit === 'frames' && (!data.fps || data.fps.length < 1))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'FPS is required when using "Timecode" or "Frames"',
          path: ['fps']
        })
      }
    }*/
    if (data.type === 'list_of_mapped_objects' && data.subfields) {
      const seenSubfieldNames = new Set<string>()
      data.subfields.forEach((subfield, subfieldIndex) => {
        if (seenSubfieldNames.has(subfield.value_key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Key must be unique',
            path: ['subfields', subfieldIndex, 'value_key']
          })
        } else {
          seenSubfieldNames.add(subfield.value_key)
        }
      })
    }
  })

const additionalParsing = z.object({
  clip: z.object({
    column: z.string().min(1).max(80),
    regex: z
      .string()
      .max(60)
      .superRefine((regex, ctx) => {
        if (regex) {
          validateRegex(regex, ['regex'], ctx)
        }
      })
      .optional()
  }),
  fields: z
    .array(field)
    .superRefine((fields, ctx) => {
      const reservedNames = ['clip', 'duration']
      const seenNames = new Set<string>(reservedNames)

      fields.forEach((field, index) => {
        if ('value_key' in field) {
          const keyLowerCase = field.value_key.toLowerCase()
          if (seenNames.has(keyLowerCase)) {
            const message = reservedNames.includes(keyLowerCase)
              ? `"${field.value_key}" is reserved and cannot be used.`
              : 'Key must be unique'
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: message,
              path: [index, 'value_key']
            })
          } else {
            seenNames.add(field.value_key)
          }
        }
      })
    })
    .optional()
})

export const pdfZodObj = z.object({
  id: z.string().length(5),
  label: z.string().nonempty('Label is required'),
  output_name: z
    .string()
    .nonempty('Output name is required')
    .endsWith('.pdf', 'Output name must end with .pdf')
    .regex(
      /^[a-zA-Z0-9<>_-]+\.pdf$/,
      'Output name must end with .pdf and contain only allowed characters before it.'
    ),
  react: z.string().nonempty('Selecting a template is required'),
  enabled: z.boolean()
})

export const emailProvidersZod = z.enum(['custom', 'postmark', 'resend', 'sendgrid'])

const disallowedRegex =
  /^(?!(host|content-length|connection|transfer-encoding|upgrade|content-type)$).+/i

const headersZod = z.object({
  header: z
    .string()
    .nonempty({ message: 'Header key is required.' })
    .regex(disallowedRegex, { message: 'This header is not allowed.' }),
  value: z.string().nonempty({ message: 'a value is required.' })
})

const customEndpoint = z.object({
  provider: emailProvidersZod.extract(['custom']),
  url: z.string().url(),
  headers: z.array(headersZod)
})

const postmarkZod = z.object({
  provider: emailProvidersZod.extract(['postmark']),
  api_key: z.string()
})

const resendZod = z.object({
  provider: emailProvidersZod.extract(['resend']),
  api_key: z.string()
})
const sendgridZod = z.object({
  provider: emailProvidersZod.extract(['sendgrid']),
  url: z.string().url(),
  api_key: z.string()
})

export const emailApiZodObj = z.discriminatedUnion('provider', [
  customEndpoint,
  postmarkZod,
  resendZod,
  sendgridZod
])

export const emailZodObj = z.object({
  id: z.string().length(5),
  label: z.string().nonempty('Label is required'),
  recipients: z
    .array(z.string().email({ message: 'Must be a vaild email' }))
    .min(1, { message: 'Must contain at least one recipient' }),
  subject: z.string().min(1, 'Subject are required'),
  attachments: z.array(z.string().length(5)).optional(),
  message: z.string().optional(),
  react: z.string().optional(),
  enabled: z.boolean()
})

export const GlobalSchemaZod = z.object({
  logid_template: z
    .string()
    .regex(/^[a-zA-Z0-9<>_-]*$/, {
      message: 'The log ID contains illegal characters.'
    })
    .regex(/^(?!.*<log>).*$/, {
      message: `The field cannot contain it's tag "<log>".`
    })
    .optional(),
  unit: z
    .string()
    .regex(/^(?!.*<unit>).*$/, {
      message: `The field cannot contain it's tag "<unit>".`
    })
    .optional(),
  custom_info: z.array(z.record(z.string())).optional(),
  default_ocf_paths: z.array(z.string()).optional(),
  default_sound_paths: z.array(z.string()).optional(),
  default_proxy_path: z.string().optional(),
  custom_fields: additionalParsing.optional(),
  emails: z.array(emailZodObj).optional(),
  email_sender: z.string().optional(),
  pdfs: z.array(pdfZodObj).optional()
})

export const ProjectSchemaZod = z.object({
  //project_id: z.string().uuid(),
  project_name: z
    .string()
    .min(1, { message: 'The project name must contain at least 1 character' })
    .max(100, { message: 'The project name must be shorter' })
    .regex(fileNameRegex, {
      message: 'Please remove any invalid characters from project name'
    })
    .refine((name) => !reservedNames.includes(name), {
      message: 'The project name cannot be a reserved name'
    }),
  ...GlobalSchemaZod.omit({ email_sender: true }).shape
})

const ProjectSettingsZod = z.object({
  project: ProjectSchemaZod,
  global: GlobalSchemaZod.optional()
})

const TemplateDirectoryFileZod = z.object({
  path: z.string(),
  name: z.string(),
  type: z.enum(['email', 'pdf']),
  scope: z.enum(['project', 'global'])
})

export const ProjectRootZod = ProjectSchemaZod.merge(
  z.object({
    settings: ProjectSettingsZod,
    templatesDir: z.array(TemplateDirectoryFileZod),
    email_sender: z.string().optional()
  })
)

  .refine(
    (data) => {
      // Check if logid_template is defined in either project or global settings
      const projectFolderTemplate = data.settings.project.logid_template
      const globalFolderTemplate = data.settings.global?.logid_template

      // Ensure that logid_template exists in at least one of them
      return !!projectFolderTemplate || !!globalFolderTemplate
    },
    {
      message: 'logid_template must be present in either project or global settings'
    }
  )
  .transform((data) => {
    // Safely return a version of data with logid_template as a required string
    const logid_template =
      data.settings.project.logid_template || data.settings.global?.logid_template

    // TypeScript check to ensure logid_template is not undefined
    if (!logid_template) {
      throw new Error('logid_template is required but was not found.')
    }

    // Return the complete object with logid_template included
    return {
      ...data,
      logid_template
    }
  })

export const GlobalSchemaZodNullable = GlobalSchemaZod.nullable()
export type fieldType = z.infer<typeof fieldType>
export type subFieldsType = z.infer<typeof subfields>
export type Field = z.infer<typeof field>
export type additionalParsing = z.infer<typeof additionalParsing>
export type emailApiType = z.infer<typeof emailApiZodObj>
export type emailType = z.infer<typeof emailZodObj>
export type pdfType = z.infer<typeof pdfZodObj>
export type TemplateDirectoryFile = z.infer<typeof TemplateDirectoryFileZod>
export type ProjectSchemaType = z.infer<typeof ProjectSchemaZod>
export type ProjectRootType = z.infer<typeof ProjectRootZod>
export type ProjectSettingsType = z.infer<typeof ProjectSettingsZod>

export type ProjectType = ProjectRootType | null

export type ProjectMenuItem = {
  label: string
  path: string
  active: boolean
}

export type ProjectToUpdate = {
  update_settings: ProjectSettingsType
  update_email_api: emailApiType | null
}

export type UpdateProjectResult = {
  success: boolean
  error?: string
  project?: ProjectType
}

export type CreateNewProjectResult = {
  success: boolean
  error?: string
  project?: ProjectType
}

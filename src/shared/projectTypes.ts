import z from 'zod'

const CSVSchema = z.object({
  Clip: z.string().or(z.array(z.string(), z.string())),
  Duration: z
    .array(z.string(), z.enum(['milliseconds', 'seconds', 'timecode', 'frames']))
    .optional(),
  Fps: z.string().or(z.array(z.string(), z.string())).optional(),
  Scene: z.string().or(z.array(z.string(), z.string())).optional(),
  Shot: z.string().or(z.array(z.string(), z.string())).optional(),
  Take: z.string().or(z.array(z.string(), z.string())).optional(),
  QC: z.string().or(z.array(z.string(), z.string())).optional(),
  Additional: z.array(z.string(), z.string()).optional()
})

const emailSettings = z.object({
  service_provider: z.string(),
  api_key_encrypted: z.string()
})

const email = z.object({
  name: z.string(),
  recipients: z.array(z.string()),
  subject: z.string(),
  body: z.string(),
  attatchments: z.array(z.string()),
  template: z.string()
})

export const GlobalSchemaZod = z.object({
  folder_template: z.string(),
  unit: z.string().optional(),
  default_ocf_paths: z.array(z.string()).optional(),
  default_proxies_path: z.string().optional(),
  enable_csv: z.boolean().optional(),
  csv_schema: CSVSchema.optional(),
  emails: z.array(email).optional(),
  email_api: emailSettings.optional()
})

export const ProjectSchemaZod = z.object({
  project_name: z.string(),
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
export type ProjectSchemaType = z.infer<typeof ProjectSchemaZod>
export type ProjectRootType = z.infer<typeof ProjectRootZod>

export type ProjectType = {
  rootPath: string
  projectPath?: string
  data?: ProjectRootType
}

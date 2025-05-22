import { z } from 'zod'
import { ProjectSchemaZod, GlobalSchemaZod, emailApiZodObj } from '@shared/projectTypes'

export type Scope = 'project' | 'global'

export const formSchema = z
  .object({
    project_project_name: ProjectSchemaZod.shape.project_name,
    project_logid_template: ProjectSchemaZod.shape.logid_template,
    project_unit: ProjectSchemaZod.shape.unit,
    project_default_ocf_paths: ProjectSchemaZod.shape.default_ocf_paths,
    project_default_sound_paths: ProjectSchemaZod.shape.default_sound_paths,
    project_default_proxy_path: ProjectSchemaZod.shape.default_proxy_path,
    project_custom_fields: ProjectSchemaZod.shape.custom_fields,
    project_emails: ProjectSchemaZod.shape.emails,
    project_pdfs: ProjectSchemaZod.shape.pdfs,
    global_logid_template: GlobalSchemaZod.shape.logid_template,
    global_unit: GlobalSchemaZod.shape.unit,
    global_default_ocf_paths: GlobalSchemaZod.shape.default_ocf_paths,
    global_default_sound_paths: GlobalSchemaZod.shape.default_sound_paths,
    global_default_proxy_path: GlobalSchemaZod.shape.default_proxy_path,
    global_custom_fields: GlobalSchemaZod.shape.custom_fields,
    global_emails: GlobalSchemaZod.shape.emails,
    global_email_sender: GlobalSchemaZod.shape.email_sender,
    global_pdfs: GlobalSchemaZod.shape.pdfs,
    project_enable_parsing: z.boolean(),
    global_enable_parsing: z.boolean(),
    new_email_api: emailApiZodObj.optional(),
    email_api_exist: z.boolean()
  })
  .superRefine((data, ctx) => {
    const projectId = data.project_logid_template?.trim() || ''
    const globalId = data.global_logid_template?.trim() || ''

    const fields = data.project_custom_fields?.fields

    if (!projectId && !globalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set folder template in project or global. Both cannot be empty.',
        path: ['project_logid_template']
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set folder template in project or global. Both cannot be empty.',
        path: ['global_logid_template']
      })
    }

    if (fields) {
      const seen = new Set<string>()
      fields.forEach((field, index) => {
        const key = field.value_key.toLowerCase()
        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Duplicate key, must be unique',
            path: ['project_custom_fields', 'fields', index, 'value_key']
          })
        } else {
          seen.add(key)
        }
      })
    }
  })
export type formSchemaType = z.infer<typeof formSchema>

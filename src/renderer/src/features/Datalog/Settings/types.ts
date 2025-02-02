import { z } from 'zod'
import { ProjectSchemaZod, GlobalSchemaZod } from '@shared/projectTypes'
import { emailApiZodObj } from '@shared/projectTypes'

export type Scope = 'project' | 'global'

export const formSchema = z
  .object({
    project_project_name: ProjectSchemaZod.shape.project_name,
    project_logid_template: ProjectSchemaZod.shape.logid_template,
    project_unit: ProjectSchemaZod.shape.unit,
    project_default_ocf_paths: ProjectSchemaZod.shape.default_ocf_paths,
    project_default_sound_paths: ProjectSchemaZod.shape.default_sound_paths,
    project_default_proxy_path: ProjectSchemaZod.shape.default_proxy_path,
    project_parse_camera_metadata: ProjectSchemaZod.shape.parse_camera_metadata,
    project_custom_fields: ProjectSchemaZod.shape.custom_fields,
    project_emails: ProjectSchemaZod.shape.emails,
    project_email_api: ProjectSchemaZod.shape.email_api,
    project_pdfs: ProjectSchemaZod.shape.pdfs,
    global_logid_template: GlobalSchemaZod.shape.logid_template,
    global_unit: GlobalSchemaZod.shape.unit,
    global_default_ocf_paths: GlobalSchemaZod.shape.default_ocf_paths,
    global_default_sound_paths: GlobalSchemaZod.shape.default_sound_paths,
    global_default_proxy_path: GlobalSchemaZod.shape.default_proxy_path,
    global_parse_camera_metadata: GlobalSchemaZod.shape.parse_camera_metadata,
    global_custom_fields: GlobalSchemaZod.shape.custom_fields,
    global_emails: GlobalSchemaZod.shape.emails,
    global_email_api: GlobalSchemaZod.shape.email_api,
    global_pdfs: GlobalSchemaZod.shape.pdfs,
    project_enable_parsing: z.boolean(),
    global_enable_parsing: z.boolean(),
    new_email_api: emailApiZodObj.optional()
  })
  .superRefine((data, ctx) => {
    const { project_logid_template, global_logid_template } = data

    if (!project_logid_template && !global_logid_template) {
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
  })
export type formSchemaType = z.infer<typeof formSchema>

import { z } from 'zod'
import { ProjectSchemaZod, GlobalSchemaZod } from '@shared/projectTypes'
import { emailApiZodObj } from '@shared/projectTypes'

export type Scope = 'project' | 'global'

export const formSchema = z
  .object({
    project_project_name: ProjectSchemaZod.shape.project_name,
    project_folder_template: ProjectSchemaZod.shape.folder_template,
    project_unit: ProjectSchemaZod.shape.unit,
    project_default_ocf_paths: ProjectSchemaZod.shape.default_ocf_paths,
    project_default_proxies_path: ProjectSchemaZod.shape.default_proxies_path,
    project_parse_camera_metadata: ProjectSchemaZod.shape.parse_camera_metadata,
    project_additional_parsing: ProjectSchemaZod.shape.additional_parsing,
    project_emails: ProjectSchemaZod.shape.emails,
    project_email_api: ProjectSchemaZod.shape.email_api,
    global_folder_template: GlobalSchemaZod.shape.folder_template,
    global_unit: GlobalSchemaZod.shape.unit,
    global_default_ocf_paths: GlobalSchemaZod.shape.default_ocf_paths,
    global_default_proxies_path: GlobalSchemaZod.shape.default_proxies_path,
    global_parse_camera_metadata: GlobalSchemaZod.shape.parse_camera_metadata,
    global_additional_parsing: GlobalSchemaZod.shape.additional_parsing,
    global_emails: GlobalSchemaZod.shape.emails,
    global_email_api: GlobalSchemaZod.shape.email_api,
    project_enable_parsing: z.boolean(),
    global_enable_parsing: z.boolean(),
    new_email_api: emailApiZodObj.optional()
  })
  .superRefine((data, ctx) => {
    const { project_folder_template, global_folder_template } = data

    if (!project_folder_template && !global_folder_template) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set folder template in project or global. Both cannot be empty.',
        path: ['project_folder_template']
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set folder template in project or global. Both cannot be empty.',
        path: ['global_folder_template']
      })
    }
  })
export type formSchemaType = z.infer<typeof formSchema>

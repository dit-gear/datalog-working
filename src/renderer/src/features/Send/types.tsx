import { emailZodObj, pdfZodObj, ProjectRootType } from '@shared/projectTypes'
import { DatalogDynamicType } from '@shared/datalogTypes'
import z from 'zod'

export const emailWithAttatchmentsZod = emailZodObj
  .omit({ attachments: true })
  .extend({ attachments: z.array(pdfZodObj).optional() })

export type emailWithAttatchmentsType = z.infer<typeof emailWithAttatchmentsZod>

export type DataObjectType = {
  project: ProjectRootType
  selection: DatalogDynamicType | DatalogDynamicType[]
  all: DatalogDynamicType[]
}

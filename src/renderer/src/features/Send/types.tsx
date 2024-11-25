import { emailZodObj, pdfZodObj } from '@shared/projectTypes'
import z from 'zod'

export const emailWithAttatchmentsZod = emailZodObj
  .omit({ attachments: true })
  .extend({ attachments: z.array(pdfZodObj).optional() })

export type emailWithAttatchmentsType = z.infer<typeof emailWithAttatchmentsZod>

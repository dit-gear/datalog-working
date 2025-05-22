import { z } from 'zod'
import { pdfZodObj, emailZodObj } from '@shared/projectTypes'

export type pdfType = z.infer<typeof pdfZodObj>
export type emailType = z.infer<typeof emailZodObj>

export type pdfEditType = {
  index: number
  pdf: pdfType
}
export type emailEditType = {
  index: number
  email: emailType
}

export const pdfWithoutIDZod = pdfZodObj.omit({ id: true })
export type pdfWitoutIDType = z.infer<typeof pdfWithoutIDZod>

export const emailWithoutIDZod = emailZodObj.omit({ id: true })
export type emailWithoutIDType = z.infer<typeof emailWithoutIDZod>

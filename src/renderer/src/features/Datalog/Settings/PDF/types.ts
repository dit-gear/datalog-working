import { z } from 'zod'
import { pdfZodObj } from '@shared/projectTypes'

export type pdfType = z.infer<typeof pdfZodObj>

export type pdfEditType = {
  index: number
  pdf: pdfType
}

export const pdfWithoutIDZod = pdfZodObj.omit({ id: true })
export type pdfWitoutIDType = z.infer<typeof pdfWithoutIDZod>

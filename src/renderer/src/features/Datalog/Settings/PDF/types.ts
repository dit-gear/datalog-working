import { z } from 'zod'
import { pdfZodObj } from '@shared/projectTypes'

export type pdfType = z.infer<typeof pdfZodObj>

export type pdfEditType = {
  index: number
  pdf: pdfType
}

const pdfWithoutID = pdfZodObj.omit({ id: true })
export type pdfWitoutIDType = z.infer<typeof pdfWithoutID>

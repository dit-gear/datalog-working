import { z } from 'zod'
import { emailZodObj } from '@shared/projectTypes'

export type emailType = z.infer<typeof emailZodObj>

export type emailEditType = {
  index: number
  email: emailType
}
export const emailWithoutIDZod = emailZodObj.omit({ id: true })
export type emailWithoutIDType = z.infer<typeof emailWithoutIDZod>

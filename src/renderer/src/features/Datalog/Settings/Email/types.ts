import { z } from 'zod'
import { emailZodObj } from '@shared/projectTypes'

export type emailType = z.infer<typeof emailZodObj>

export type emailEditType = {
  index: number
  email: emailType
}

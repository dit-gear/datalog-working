import { z } from 'zod'
import { emailZodObj } from '@shared/projectTypes'

export type emailType = z.infer<typeof emailZodObj>

export type emailEditType = {
  index: number
  email: emailType
}

export const emailApiZodObj = z.object({
  provider: z.enum(['resend', 'sendgrid']),
  api_key: z.string(),
  api_secret: z.string().min(5, { message: 'Must be 5 or more characters long' })
})

export type emailApiType = z.infer<typeof emailApiZodObj>

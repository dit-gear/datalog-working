import { z } from 'zod'

export const emailZodObj = z.object({
  name: z.string(),
  show: z.object({ item: z.boolean(), root: z.boolean() }),
  sender: z.string().email().optional(),
  recipients: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  attatchments: z.array(z.string()).optional(),
  body: z.string().optional(),
  template: z.string() // url to file.
})

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

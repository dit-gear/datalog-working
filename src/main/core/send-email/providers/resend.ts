import { Resend } from 'resend'
import { emailToSend } from '../types'

export const resend = async (email: emailToSend) => {
  const resend = new Resend(import.meta.env.VITE_RESEND_TESTKEY)

  const { error } = await resend.emails.send({
    from: 'Philip Bengtsson <philip@datalog.email>',
    to: email.email.recipients,
    subject: email.email.subject,
    html: email.rendered.emailcode.code ?? '',
    text: email.rendered.emailcode.plainText
  })
  if (error) {
    throw new Error(`Resend API error: ${error.message}`)
  }
}

import { resend } from './providers/resend'
import { emailToSend } from './types'

export const emailprovider = async (email: emailToSend) => {
  let provider = 'resend'

  switch (provider) {
    case 'resend':
      return await resend(email)
  }
}

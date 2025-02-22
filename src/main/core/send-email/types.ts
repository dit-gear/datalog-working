import { emailType } from '@shared/projectTypes'

type providers = 'custom' | 'postmark' | 'resend' | 'sendgrid'
interface apiData {
  provider: providers
  sender: string
  url: string
  headers: {
    header: string
    value: string
  }[]
  apikey: string
}

export interface emailToSend {
  email: emailType
  api: apiData
  rendered: {
    emailcode: {
      code: string
      plainText?: string
    }
    attachmentsToSend: {
      content: string
      filename: string
    }[]
  }
}

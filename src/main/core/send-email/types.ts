import { emailType } from '@shared/projectTypes'

export interface emailToSend {
  email: emailType
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

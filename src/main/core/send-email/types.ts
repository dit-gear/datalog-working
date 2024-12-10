import { emailType } from '@shared/projectTypes'

export interface emailToSend {
  email: emailType
  rendered: {
    emailcode: string | undefined
    attachmentsToSend: {
      content: string
      filename: string
    }[]
  }
}

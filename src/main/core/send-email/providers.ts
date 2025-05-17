import { emailToSend } from './types'
import { emailApiType } from '@shared/projectTypes'

function assertNever(x: never): never {
  throw new Error(`Unhandled provider: ${JSON.stringify(x)}`)
}

export function getProviderOptions(
  apiInfo: emailApiType,
  email: emailToSend,
  sender: string
): {
  url: string
  headers: HeadersInit
  body: string
} {
  switch (apiInfo.provider) {
    case 'resend': {
      if (!sender) throw new Error('Missing sender for resend provider.')
      return {
        url: 'https://api.resend.com/emails',
        headers: {
          Authorization: `Bearer ${apiInfo.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: sender,
          to: email.email.recipients,
          subject: email.email.subject,
          html: email.rendered.emailcode.code,
          text: email.rendered.emailcode.plainText,
          attachments: email.rendered.attachmentsToSend?.map((att) => ({
            content: att.content,
            filename: att.filename
          }))
        })
      }
    }
    case 'sendgrid': {
      return {
        url: apiInfo.url,
        headers: {
          Authorization: `Bearer ${apiInfo.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: email.email.recipients }] }],
          subject: email.email.subject,
          content: [{ type: 'text/html', value: email.rendered.emailcode.code }],
          attachments: email.rendered.attachmentsToSend?.map((att) => ({
            content: att.content,
            filename: att.filename,
            type: 'application/pdf',
            disposition: 'attachment'
          }))
        })
      }
    }
    case 'postmark': {
      return {
        url: 'https://api.postmarkapp.com/email',
        headers: {
          'X-Postmark-Server-Token': apiInfo.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          From: sender,
          To: email.email.recipients,
          Subject: email.email.subject,
          TextBody: email.rendered.emailcode.plainText,
          HtmlBody: email.rendered.emailcode.code,
          Attachments: email.rendered.attachmentsToSend?.map((att) => ({
            Name: att.filename,
            Content: att.content,
            ContentType: 'application/pdf'
          }))
        })
      }
    }
    case 'custom': {
      return {
        url: apiInfo.url,
        headers: Object.fromEntries(apiInfo.headers.map(({ header, value }) => [header, value])),
        body: JSON.stringify({
          from: sender,
          to: email.email.recipients,
          subject: email.email.subject,
          html: email.rendered.emailcode.code,
          text: email.rendered.emailcode.plainText,
          attachments: email.rendered.attachmentsToSend?.map((att) => ({
            filename: att.filename,
            content: att.content
          }))
        })
      }
    }
    default:
      return assertNever(apiInfo)
  }
}

/*
interface EmailProviderFunctions {
  resend: (
    apiInfo: Extract<emailApiType, { provider: 'resend' }>,
    email: emailToSend,
    sender: string
  ) => { url: string; headers: HeadersInit; body: string }
  sendgrid: (
    apiInfo: Extract<emailApiType, { provider: 'sendgrid' }>,
    email: emailToSend,
    sender: string
  ) => { url: string; headers: HeadersInit; body: string }
  postmark: (
    apiInfo: Extract<emailApiType, { provider: 'postmark' }>,
    email: emailToSend,
    sender: string
  ) => { url: string; headers: HeadersInit; body: string }
  custom: (
    apiInfo: Extract<emailApiType, { provider: 'custom' }>,
    email: emailToSend,
    sender: string
  ) => { url: string; headers: HeadersInit; body: string }
}

export const emailProviders: EmailProviderFunctions = {
  resend: (apiInfo, email, sender) => {
    if (!sender) throw new Error('Missing sender for resend provider.')
    return {
      url: 'https://api.resend.com/emails',
      headers: {
        Authorization: `Bearer ${apiInfo.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: sender,
        to: email.email.recipients,
        subject: email.email.subject,
        html: email.rendered.emailcode.code,
        text: email.rendered.emailcode.plainText,
        attachments: email.rendered.attachmentsToSend?.map((att) => ({
          filename: att.filename,
          content: att.content
        }))
      })
    }
  },
  sendgrid: (apiInfo, email, sender) => ({
    url: apiInfo.url,
    headers: {
      Authorization: `Bearer ${apiInfo.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: email.email.recipients }] }],
      subject: email.email.subject,
      content: [{ type: 'text/html', value: email.rendered.emailcode.code }],
      attachments: email.rendered.attachmentsToSend?.map((att) => ({
        content: att.content,
        filename: att.filename,
        type: 'application/pdf',
        disposition: 'attachment'
      }))
    })
  }),
  postmark: (apiInfo, email, sender) => ({
    url: 'https://api.postmarkapp.com/email',
    headers: {
      'X-Postmark-Server-Token': apiInfo.api_key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      From: sender,
      To: email.email.recipients,
      Subject: email.email.subject,
      TextBody: email.rendered.emailcode.plainText,
      HtmlBody: email.rendered.emailcode.code,
      Attachments: email.rendered.attachmentsToSend?.map((att) => ({
        Name: att.filename,
        Content: att.content,
        ContentType: 'application/pdf'
      }))
    })
  }),
  custom: (apiInfo, email, sender) => ({
    url: apiInfo.url,
    headers: Object.fromEntries(apiInfo.headers.map(({ header, value }) => [header, value])),
    body: JSON.stringify({
      from: sender,
      to: email.email.recipients,
      subject: email.email.subject,
      html: email.rendered.emailcode.code,
      text: email.rendered.emailcode.plainText,
      attachments: email.rendered.attachmentsToSend?.map((att) => ({
        filename: att.filename,
        content: att.content
      }))
    })
  })
}
*/

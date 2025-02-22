import { emailToSend } from './types'

const emailProviders = {
  resend: {
    url: 'https://api.resend.com/emails',
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    body: (data: emailToSend, sender: string) =>
      JSON.stringify({
        from: sender,
        to: data.email.recipients,
        subject: data.email.subject,
        html: data.rendered.emailcode.code,
        text: data.rendered.emailcode.plainText,
        attachments: data.rendered.attachmentsToSend?.map((att) => ({
          filename: att.filename,
          content: att.content // base64-encoded PDF content
        }))
      })
  },
  sendgrid: {
    url: (url: string) => url,
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    body: (data: emailToSend) =>
      JSON.stringify({
        personalizations: [{ to: [{ email: data.email.recipients }] }],
        //from: { email: data. },
        subject: data.email.subject,
        content: [{ type: 'text/html', value: data.rendered.emailcode.code }],
        attachments: data.rendered.attachmentsToSend?.map((att) => ({
          content: att.content, // base64-encoded PDF content
          filename: att.filename,
          type: 'application/pdf',
          disposition: 'attachment'
        }))
      })
  },
  postmark: {
    url: 'https://api.postmarkapp.com/email',
    headers: (apiKey: string) => ({
      'X-Postmark-Server-Token': apiKey,
      'Content-Type': 'application/json'
    }),
    body: (data: emailToSend) =>
      JSON.stringify({
        From: data.email,
        To: data.email.recipients,
        Subject: data.email.subject,
        TextBody: data.rendered.emailcode.plainText,
        HtmlBody: data.rendered.emailcode.code,
        Attachments: data.rendered.attachmentsToSend?.map((att) => ({
          Name: att.filename,
          Content: att.content, // base64-encoded PDF content
          ContentType: 'application/pdf'
        }))
      })
  }
}

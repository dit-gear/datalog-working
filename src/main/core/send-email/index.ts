import { emailToSend } from './types'
import { retrieveObjectFromKeychain } from '../../utils/keychain'
import { getProviderOptions } from './providers'
import { emailApiZodObj } from '@shared/projectTypes'
import { appState } from '../app-state/state'

export const sendEmail = async (email: emailToSend) => {
  try {
    const sender = appState.project?.email_sender
    if (!sender) throw new Error('Sender ("from") address has not been defined')
    const apiInfoString = await retrieveObjectFromKeychain('email_api')
    if (!apiInfoString) throw new Error('No Email Config')
    const apiInfo = emailApiZodObj.parse(JSON.parse(apiInfoString))

    const { url, headers, body } = getProviderOptions(apiInfo, email, sender)

    console.log(url, headers, body)
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    })
    console.log(response)

    if (!response.ok) {
      throw new Error(`Email sending failed: (${response.status}) ${response.statusText}`)
    }

    return
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error()
  }
}

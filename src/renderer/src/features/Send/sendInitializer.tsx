import { useEffect, useState } from 'react'
import { emailType } from '@shared/projectTypes'
import SendSelector from './sendSelector'

const SendInitializer = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [projectEmails, setProjectEmails] = useState<emailType[]>([])

  useEffect(() => {
    window.api.initSendWindow((project) => {
      const emails = project?.emails
      if (emails) setProjectEmails(emails)
    })
    setLoading(false)
  })
  if (loading) return <div>Loading...</div>

  return <SendSelector projectEmails={projectEmails} />
}

export default SendInitializer

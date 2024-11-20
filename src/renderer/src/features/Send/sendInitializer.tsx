import { useEffect, useState } from 'react'
import { emailType, TemplateDirectoryFile } from '@shared/projectTypes'
import SendSelector from './sendSelector'

const SendInitializer = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [projectEmails, setProjectEmails] = useState<emailType[]>([])
  const [projectTemplates, setProjectTemplates] = useState<TemplateDirectoryFile[]>([])

  useEffect(() => {
    window.sendApi.initSendWindow((project) => {
      const emails = project?.emails
      const templates = project?.templatesDir
      if (emails) setProjectEmails(emails)
      if (templates) setProjectTemplates(templates)
    })
    setLoading(false)
  })
  if (loading) return <div>Loading...</div>

  return <SendSelector projectEmails={projectEmails} projectTemplates={projectTemplates} />
}

export default SendInitializer

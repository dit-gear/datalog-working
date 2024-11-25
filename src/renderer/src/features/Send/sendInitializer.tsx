import { useState, useEffect } from 'react'
import { emailType, pdfType, TemplateDirectoryFile } from '@shared/projectTypes'
import { DatalogDynamicType } from '@shared/datalogTypes'
import SendSelector from './sendSelector'

const SendInitializer = () => {
  const [projectEmails, setProjectEmails] = useState<emailType[]>([])
  const [projectPdfs, setProjectPdfs] = useState<pdfType[]>([])
  const [projectTemplates, setProjectTemplates] = useState<TemplateDirectoryFile[]>([])
  const [datalogs, setDatalogs] = useState<DatalogDynamicType[]>([])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await window.sendApi.fetchInitialData()
        if (data.project.emails) setProjectEmails(data.project.emails)
        if (data.project.pdfs) setProjectPdfs(data.project.pdfs)
        if (data.project.templatesDir) setProjectTemplates(data.project.templatesDir)
        if (data.datalogs) setDatalogs(data.datalogs)
      } catch (error) {
        console.log(error)
      } finally {
        window.sendApi.showWindow()
      }
    }

    loadInitialData()
  }, [])

  return (
    <SendSelector
      projectEmails={projectEmails}
      projectPdfs={projectPdfs}
      projectTemplates={projectTemplates}
    />
  )
}

export default SendInitializer

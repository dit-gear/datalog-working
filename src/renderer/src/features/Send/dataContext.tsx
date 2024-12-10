import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { emailType, pdfType, TemplateDirectoryFile, ProjectRootType } from '@shared/projectTypes'
import { DataObjectType } from './types'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'

type DataContextType = {
  data?: DataObjectType
  defaultSelectedEmail?: emailType
  projectEmails: emailType[]
  projectPdfs: pdfType[]
  projectTemplates: TemplateDirectoryFile[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [defaultSelectedEmail, setDefaultSelectedEmail] = useState<emailType>()
  const [projectEmails, setProjectEmails] = useState<emailType[]>([])
  const [projectPdfs, setProjectPdfs] = useState<pdfType[]>([])
  const [projectTemplates, setProjectTemplates] = useState<TemplateDirectoryFile[]>([])
  const [data, setData] = useState<DataObjectType>()

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const fetchedData = await window.sendApi.fetchInitialData()

        if (fetchedData.project.emails) setProjectEmails(fetchedData.project.emails)
        if (fetchedData.project.pdfs) setProjectPdfs(fetchedData.project.pdfs)
        if (fetchedData.selectedEmail) setDefaultSelectedEmail(fetchedData.selectedEmail)
        if (fetchedData.project.templatesDir) setProjectTemplates(fetchedData.project.templatesDir)

        if (fetchedData.datalogs) {
          setData({
            project: fetchedData.project,
            selection:
              fetchedData.selection ?? getLatestDatalog(fetchedData.datalogs, fetchedData.project),
            all: fetchedData.datalogs
          })
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        window.sendApi.showWindow()
      }
    }

    loadInitialData()
  }, [])

  return (
    <DataContext.Provider
      value={{ data, defaultSelectedEmail, projectEmails, projectPdfs, projectTemplates }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useDataContext = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}

import { ReactElement } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import Pdfs from './pdf/Pdfs'
import Emails from './email/Emails'

//import Emails from './Emails'

interface PdfTabProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const PresetsTab = ({ scope, templates }: PdfTabProps): ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Presets</CardTitle>
        <CardDescription>Email and PDF Presets to display in menu</CardDescription>
      </CardHeader>
      {scope === 'project' ? (
        <>
          <Pdfs key="pdf_project" scope="project" templates={templates} />
          <Emails key="emails_projext" scope="project" templates={templates} />
        </>
      ) : (
        <>
          <Pdfs key="pdfs_global" scope="global" templates={templates} />
          <Emails key="emails_global" scope="global" templates={templates} />
        </>
      )}
    </Card>
  )
}

export default PresetsTab

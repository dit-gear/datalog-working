import { ReactElement } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import Pdfs from './Pdfs'

//import Emails from './Emails'

interface PdfTabProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const PdfTab = ({ scope, templates }: PdfTabProps): ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Files and Exports</CardTitle>
        <CardDescription>PDF Settings and Presets</CardDescription>
      </CardHeader>
      {scope === 'project' ? (
        <Pdfs key="project" scope="project" templates={templates} />
      ) : (
        <Pdfs key="global" scope="global" templates={templates} />
      )}
    </Card>
  )
}

export default PdfTab

import { ReactElement } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { TemplateDirectoryFile } from '@shared/projectTypes'

import Emails from './Emails'

interface EmailTabProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const EmailTab = ({ scope, templates }: EmailTabProps): ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>Email Settings and presets</CardDescription>
      </CardHeader>
      {scope === 'project' ? (
        <Emails key="project" scope="project" templates={templates} />
      ) : (
        <Emails key="global" scope="global" templates={templates} />
      )}
    </Card>
  )
}

export default EmailTab

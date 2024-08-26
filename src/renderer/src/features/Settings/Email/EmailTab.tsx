import { ReactElement } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card'

import Emails from './Emails'

interface EmailTabProps {
  scope: 'project' | 'global'
}

const EmailTab = ({ scope }: EmailTabProps): ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>Project settings</CardDescription>
      </CardHeader>
      {scope === 'project' ? (
        <Emails key="project" scope="project" />
      ) : (
        <Emails key="global" scope="global" />
      )}
    </Card>
  )
}

export default EmailTab

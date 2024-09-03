import { ReactElement } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@components/ui/card'

import Paths from './Paths'

interface EmailTabProps {
  scope: 'project' | 'global'
}

const PathsTab = ({ scope }: EmailTabProps): ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>OCF / Proxies Paths</CardTitle>
        <CardDescription>
          You can optionally add default paths with dynamic tags to streamline your workflow.
        </CardDescription>
      </CardHeader>
      {scope === 'project' ? (
        <Paths key="project" scope="project" />
      ) : (
        <Paths key="global" scope="global" />
      )}
    </Card>
  )
}

export default PathsTab

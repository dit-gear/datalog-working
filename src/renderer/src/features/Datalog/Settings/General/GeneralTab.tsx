import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { formSchemaType } from '../types'
import { useFormContext, useWatch } from 'react-hook-form'
import GeneralContent from './GeneralContent'

export interface GeneralTabProps {
  scope: 'project' | 'global'
}

const GeneralTab: React.FC<GeneralTabProps> = ({ scope }) => {
  const { control, trigger } = useFormContext<formSchemaType>()

  const projectFolderTemplateValue = useWatch({ control, name: 'project_logid_template' })
  const globalFolderTemplateValue = useWatch({ control, name: 'global_logid_template' })

  useEffect(() => {
    if (projectFolderTemplateValue !== undefined || globalFolderTemplateValue !== undefined) {
      trigger(['project_logid_template', 'global_logid_template'])
    }
  }, [projectFolderTemplateValue, globalFolderTemplateValue, trigger])

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Project settings</CardDescription>
      </CardHeader>
      <CardContent>
        <GeneralContent scope={scope} />
      </CardContent>
    </Card>
  )
}

export default GeneralTab

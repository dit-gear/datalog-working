import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { formSchemaType } from './types'
import { useFormContext, useWatch } from 'react-hook-form'
import FormRow from '@components/FormRow'

interface GeneralTabProps {
  scope: 'project' | 'global'
}

const GeneralTab: React.FC<GeneralTabProps> = ({ scope }) => {
  const { control, trigger } = useFormContext<formSchemaType>()

  const projectFolderTemplateValue = useWatch({ control, name: 'project_folder_template' })
  const globalFolderTemplateValue = useWatch({ control, name: 'global_folder_template' })

  useEffect(() => {
    if (projectFolderTemplateValue !== undefined || globalFolderTemplateValue !== undefined) {
      trigger(['project_folder_template', 'global_folder_template'])
    }
  }, [projectFolderTemplateValue, globalFolderTemplateValue, trigger])

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Project settings</CardDescription>
      </CardHeader>
      <CardContent>
        {scope === 'project' ? (
          <>
            <FormRow
              name="project_project_name"
              label="Project Name"
              descriptionTag={['Required for Project', `Tag: <project_name>`]}
            />
            <FormRow
              name="project_folder_template"
              label="Entry Name Format"
              description="Set Entry Name Format for dynamically naming your entries and folders"
              descriptionTag={['Required (project or global)', 'Tag: None']}
            />
            <FormRow
              name="project_unit"
              label="Unit"
              description="Set the unit for the project."
              descriptionTag={['Optional', 'Tag: <unit>']}
            />
          </>
        ) : (
          <>
            <FormRow
              name="global_projectName"
              label="Project Name"
              descriptionTag={['Required for Project', `Tag: <project_name>`]}
              placeholder="Not applicable within global scope"
              disabled
            />
            <FormRow
              name="global_folder_template"
              label="Entry Name Format"
              description="Set Entry Name Format for dynamically naming your entries and folders"
              descriptionTag={['Required (project or global)', 'Tag: None']}
            />
            <FormRow
              name="global_unit"
              label="Unit"
              description="Set the unit for the project."
              descriptionTag={['Optional', 'Tag: <unit>']}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default GeneralTab

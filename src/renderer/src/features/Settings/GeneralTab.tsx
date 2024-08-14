import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { ScrollArea } from '@components/ui/scroll-area'
import { schemaType } from './settings'
import { Form, useFormContext } from 'react-hook-form'
import FormRow from '@components/FormRow'

interface GeneralTabProps {
  scope: 'project' | 'global'
}

const GeneralTab: React.FC<GeneralTabProps> = ({ scope }) => {
  const { watch, clearErrors, setError } = useFormContext<schemaType>()

  const projectFolderTemplate = watch('project_folderTemplate')
  const globalFolderTemplate = watch('global_folderTemplate')

  useEffect(() => {
    if (projectFolderTemplate || globalFolderTemplate) {
      clearErrors(['project_folderTemplate', 'global_folderTemplate'])
    } else {
      // Set error on both fields if neither is filled
      setError('project_folderTemplate', {
        type: 'manual',
        message: 'Either needs to be set in this project or in global. Both cannot be empty.'
      })
      setError('global_folderTemplate', {
        type: 'manual',
        message: 'Either needs to be set in this project or in global. Both cannot be empty.'
      })
    }
  }),
    [projectFolderTemplate, globalFolderTemplate, clearErrors]

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
              name="projectName"
              label="Project Name"
              descriptionTag={['Required for Project', `Tag: <project_name>`]}
            />
            <FormRow
              name="project_folderTemplate"
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
              name="global_folderTemplate"
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

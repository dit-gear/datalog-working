import { GeneralTabProps } from './GeneralTab'
import FormRow from '@components/FormRow'
import { useFormContext } from 'react-hook-form'
import { formSchemaType } from '../types'
import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Input } from '@components/ui/input'

const GeneralContent = ({ scope }: GeneralTabProps) => {
  const { control } = useFormContext<formSchemaType>()
  return (
    <>
      {scope === 'project' ? (
        <FormField
          key={`project_project_name`}
          control={control}
          name={`project_project_name`}
          render={({ field }) => (
            <FormItem>
              <FormRow
                name={field.name}
                label="Project Name"
                descriptionTag={['Required for Project', `Tag: <project_name>`]}
              >
                <FormControl>
                  <Input {...field} className="max-w-80" />
                </FormControl>
              </FormRow>
            </FormItem>
          )}
        />
      ) : (
        <FormRow
          name={'global_projectName'}
          label="Project Name"
          descriptionTag={['Required for Project', `Tag: <project_name>`]}
        >
          <FormControl>
            <Input className="max-w-80" placeholder="Not applicable within global scope" disabled />
          </FormControl>
        </FormRow>
      )}
      <FormField
        key={`${scope}_logid_template`}
        control={control}
        name={`${scope}_logid_template`}
        render={({ field }) => (
          <FormItem>
            <FormRow
              name={field.name}
              label="Default Log Name"
              description="Dynamic naming of your logs and folders"
              descriptionTag={['Required (project or global)', 'Tag: <log>']}
            >
              <FormControl>
                <Input {...field} className="max-w-80" />
              </FormControl>
            </FormRow>
          </FormItem>
        )}
      />
      <FormField
        key={`${scope}_unit`}
        control={control}
        name={`${scope}_unit`}
        render={({ field }) => (
          <FormItem>
            <FormRow
              name={field.name}
              label="Production Unit"
              description="Set the unit for the project."
              descriptionTag={['Optional', 'Tag: <unit>']}
            >
              <FormControl>
                <Input {...field} className="max-w-80" />
              </FormControl>
            </FormRow>
          </FormItem>
        )}
      />
    </>
  )
}

export default GeneralContent

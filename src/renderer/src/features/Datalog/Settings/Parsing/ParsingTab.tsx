import { ReactElement } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Switch } from '@components/ui/switch'
import { useWatch, useFormContext } from 'react-hook-form'
import ParsingWrapper from './ParsingWrapper'
import FormRow from '@components/FormRow'

interface ParsingTabProps {
  scope: 'project' | 'global'
}

const ParsingTab = ({ scope }: ParsingTabProps): ReactElement => {
  const { control } = useFormContext()
  const watchEnableParsingLocal = useWatch({ control, name: 'project_enable_parsing' })
  const watchEnableParsingGlobal = useWatch({ control, name: 'global_enable_parsing' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata Fields</CardTitle>
        <CardDescription>
          You can optionally import more metadata to merge with your clips.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormRow label="Enable Custom Fields">
          <div>
            <dd className="mt-1 text-sm leading-6 text-gray-400 flex flex-col gap-3">
              {scope === 'project' ? (
                <FormField
                  key="project_enable_parsing"
                  control={control}
                  name="project_enable_parsing"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  key="global_enable_parsing"
                  control={control}
                  name="global_enable_parsing"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </dd>
            {scope === 'project' && watchEnableParsingLocal ? (
              <ParsingWrapper key="local_fields" scope={scope} />
            ) : null}
            {scope === 'global' && watchEnableParsingGlobal ? (
              <ParsingWrapper key="global_fields" scope={scope} />
            ) : null}
          </div>
        </FormRow>
      </CardContent>
    </Card>
  )
}

export default ParsingTab

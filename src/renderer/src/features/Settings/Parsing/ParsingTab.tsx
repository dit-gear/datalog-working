import { ReactElement } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Switch } from '@components/ui/switch'
import { useWatch, useFormContext } from 'react-hook-form'
import ParsingWrapper from './ParsingWrapper'

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
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-white">Parse Camera metadata</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
            {scope === 'project' ? (
              <FormField
                key="project_parse_camera_metadata"
                control={control}
                name="project_parse_camera_metadata"
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
                key="global_parse_camera_metadata"
                control={control}
                name="global_parse_camera_metadata"
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
          <dt className="text-sm font-medium leading-6 text-white">Enable Custom Fields</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
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
      </CardContent>
    </Card>
  )
}

export default ParsingTab

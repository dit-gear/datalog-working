import { ReactElement } from 'react'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@components/ui/card'
import { Input } from '@components/ui/input'
import FormRow from '@components/FormRow'
import { FormField, FormItem, FormControl } from '@components/ui/form'
import EmailApi from './EmailAPI/EmailApi'
import { useFormContext } from 'react-hook-form'
import { formSchemaType } from '../types'

const SelfManagedTab = (): ReactElement => {
  const { control } = useFormContext<formSchemaType>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Self Managed</CardTitle>
        <CardDescription>Preferences for self managing Email distribution</CardDescription>
      </CardHeader>
      <CardContent key={'selfmanaged'}>
        <FormField
          key={`global_email_sender`}
          control={control}
          name={`global_email_sender`}
          render={({ field }) => (
            <FormItem>
              <FormRow
                name={field.name}
                label={`Sender/From-field`}
                descriptionTag={
                  'Email address and name (optional) in the "from" field. Check with your Email API provider for supported formatting.'
                }
              >
                <FormControl>
                  <Input {...field} className="max-w-80" />
                </FormControl>
              </FormRow>
            </FormItem>
          )}
        />

        <EmailApi />
      </CardContent>
    </Card>
  )
}

export default SelfManagedTab

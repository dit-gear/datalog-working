import { TabsTrigger } from '@components/ui/tabs'
import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Select, SelectContent, SelectItem } from '@components/ui/select'
import { SelectTrigger } from '@components/SelectIconTrigger'
import { useDataContext } from '../dataContext'
import { useFormContext } from 'react-hook-form'

const EmailTab = () => {
  const { projectTemplates } = useDataContext()
  const { control } = useFormContext()

  return (
    <TabsTrigger value="email" className="border-t border-l border-r rounded-t-lg px-4 pb-2">
      <span className="flex gap-4 h-4 items-center">
        Email Preview
        <FormField
          control={control}
          name="react"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={(value) => field.onChange(value)} // Update the form state
                >
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="plain-text">Plain-text</SelectItem>
                    {projectTemplates
                      .filter((template) => template.type === 'email')
                      .map((template) => (
                        <SelectItem key={template.path} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </span>
    </TabsTrigger>
  )
}

export default EmailTab

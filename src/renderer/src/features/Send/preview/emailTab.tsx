import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Select, SelectContent, SelectItem } from '@components/ui/select'
import { SelectTrigger } from '@components/SelectIconTrigger'
import { useData } from '../utils/useData'
import { useFormContext } from 'react-hook-form'

interface EmailTabProps {
  active: boolean
  onTabClick: (id: string, type: 'email') => void
}
const EmailTab = ({ active, onTabClick }: EmailTabProps) => {
  const { data } = useData()
  const projectTemplates = data?.project.templatesDir ?? []
  const { control, getValues } = useFormContext()

  return (
    <div
      className={`${active ? 'bg-accent' : 'bg-background'} border-t border-l border-r rounded-t-md pl-4  pb-2 text-sm ring-offset-background transition-colors hover:bg-accent`}
    >
      <span className="flex">
        <button onClick={() => onTabClick(getValues('react'), 'email')} className="pr-4">
          Email Preview
        </button>
        <FormField
          control={control}
          name="react"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={(value) => {
                    field.onChange(value), onTabClick(value, 'email')
                  }}
                >
                  <SelectTrigger />
                  <SelectContent>
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
    </div>
  )
}

export default EmailTab

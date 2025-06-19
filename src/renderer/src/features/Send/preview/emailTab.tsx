import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Select, SelectContent, SelectItem } from '@components/ui/select'
import { SelectTrigger } from '@components/SelectIconTrigger'
import { useData } from '../utils/useData'
import { useFormContext } from 'react-hook-form'
import { CustomTab } from '@components/CustomTab'

interface EmailTabProps {
  active: boolean
  onTabClick: (id: string, reactId: string, type: 'email') => void
}
const EmailTab = ({ active, onTabClick }: EmailTabProps) => {
  const { data } = useData()
  const projectTemplates = data?.project.templatesDir ?? []
  const { control, getValues } = useFormContext()

  return (
    <CustomTab
      key="email"
      variant="outline"
      isActive={active}
      size="sm"
      label="Email"
      onClick={() => onTabClick('email', getValues('react'), 'email')}
    >
      <span
        className="flex items-center gap-4 z-40"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <FormField
          control={control}
          name="react"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={(value) => {
                    field.onChange(value), onTabClick('email', value, 'email')
                  }}
                >
                  <SelectTrigger className={`border-none ${!active && 'hidden'}`} />
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
    </CustomTab>
  )
}

export default EmailTab

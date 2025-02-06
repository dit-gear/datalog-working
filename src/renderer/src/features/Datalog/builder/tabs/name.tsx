import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from '@components/ui/form'
import { Input } from '@components/ui/input'
import DatePicker from '@components/DatePicker'
import { Button } from '@components/ui/button'
import { Pencil } from 'lucide-react'
import replaceTags from '../../../../../../shared/utils/formatDynamicString'
import { ProjectRootType } from '@shared/projectTypes'

interface Nameprops {
  project: ProjectRootType
}

export const Name = ({ project }: Nameprops) => {
  const { control, setValue } = useFormContext()

  const [folderEdit, setFolderEdit] = useState<boolean>(false)

  const daywatch = useWatch({ name: 'day' })
  const datewatch = useWatch({ name: 'date' })
  const unitwatch = useWatch({ name: 'unit' })

  useEffect(() => {
    const tags = {
      day: daywatch,
      date: datewatch,
      unit: unitwatch !== '' ? unitwatch : undefined,
      projectName: project.project_name
    }
    setValue('id', replaceTags(project.logid_template, tags))
  }, [daywatch, datewatch, unitwatch])

  return (
    <div className="space-y-16">
      <div className="flex flex-col gap-1 mt-8">
        <FormField
          control={control}
          name="day"
          rules={{
            max: { value: 999, message: 'The day must be less than or equal to 999' },
            min: { value: 1, message: 'The day must be greater than or equal to 1' },
            required: 'Day is required' // Optional: add required validation
          }}
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormLabel className="w-24 text-base">Day</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="w-16"
                  {...field}
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      'Backspace',
                      'ArrowLeft',
                      'ArrowRight',
                      'Delete',
                      'Tab',
                      '.'
                    ]
                    if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormLabel className="w-24 text-base">Date</FormLabel>
              <FormControl>
                <DatePicker field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="unit"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormLabel className="w-24 text-base">Unit</FormLabel>
              <FormControl>
                <Input type="text" className="w-60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="id"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <FormLabel className="w-24 text-base">Log Name</FormLabel>
            <div className="flex gap-2 w-full max-w-sm">
              <FormControl>
                <Input id="id" type="text" disabled={!folderEdit} {...field} />
              </FormControl>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  setFolderEdit((prev) => {
                    const newValue = !prev
                    if (newValue) {
                      setTimeout(() => {
                        document.getElementById('id')?.focus()
                      }, 0)
                    }
                    return newValue
                  })
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default Name

//flex gap-8 items-center"

/*    <div className="space-y-16">
      <div>
      <FormField
        control={control}
        name="day"
        rules={{
          max: { value: 999, message: 'The day must be less than or equal to 999' },
          min: { value: 1, message: 'The day must be greater than or equal to 1' },
          required: 'Day is required' // Optional: add required validation
        }}
        render={({ field }) => (
          <FormItem className="flex items-center">
            <FormLabel className="w-24 flex-shrink-0 text-base">Day</FormLabel>
            <FormControl>
              <Input
                type="text"
                className="w-16"
                {...field}
                onKeyDown={(e) => {
                  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', '.']
                  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <FormLabel className="w-24 flex-shrink-0 text-base">Date</FormLabel>
            <FormControl>
              <DatePicker field={field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="unit"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <FormLabel className="w-24 flex-shrink-0 text-base">Unit</FormLabel>
            <FormControl>
              <Input type="text" className="w-60" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="id"
        render={({ field }) => (
          <FormItem className="flex items-center">
            <FormLabel className="w-24 flex-shrink-0 text-base">Log Name</FormLabel>
            <div className="flex gap-2 w-full max-w-sm">
              <FormControl>
                <Input id="id" type="text" disabled={!folderEdit} {...field} />
              </FormControl>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  setFolderEdit((prev) => {
                    const newValue = !prev
                    if (newValue) {
                      setTimeout(() => {
                        document.getElementById('id')?.focus()
                      }, 0)
                    }
                    return newValue
                  })
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div> */

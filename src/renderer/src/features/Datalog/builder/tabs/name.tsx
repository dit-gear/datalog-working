import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from '@components/ui/form'
import { Input } from '@components/ui/input'
import DatePicker from '@components/DatePicker'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { Pencil } from 'lucide-react'
import replaceTags from '../../../../utils/formatDynamicString'
import { ProjectRootType } from '@shared/projectTypes'

interface Nameprops {
  project: ProjectRootType
}

export const Name = ({ project }: Nameprops) => {
  const {
    control,
    formState: { errors },
    setValue,
    register
  } = useFormContext()

  const [folderEdit, setFolderEdit] = useState<boolean>(false)

  const daywatch = useWatch({ name: 'Day' })
  const datewatch = useWatch({ name: 'Date' })
  const unitwatch = useWatch({ name: 'Unit' })

  useEffect(() => {
    const tags = {
      day: daywatch,
      date: datewatch,
      unit: unitwatch !== '' ? unitwatch : undefined,
      projectName: project.project_name
    }
    setValue('Folder', replaceTags(project.folder_template, tags))
  }, [daywatch, datewatch, unitwatch])

  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium leading-6 text-white">Entry Naming</dt>
      <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
        <div className="flex gap-10 mb-10">
          <FormField
            control={control}
            name="Day"
            rules={{
              max: { value: 999, message: 'The day must be less than or equal to 999' },
              min: { value: 1, message: 'The day must be greater than or equal to 1' },
              required: 'Day is required' // Optional: add required validation
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Day</FormLabel>
                <FormControl>
                  <Input
                    id="day"
                    type="number"
                    min={1}
                    max={999}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="w-16"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="Date"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-between pt-1">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="Unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input id="unit" type="text" className="w-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="folder">Entry Name</Label>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              id="folder"
              disabled={!folderEdit}
              type="text"
              className={errors.Folder ? 'border-red-500' : ''}
              {...register('Folder')}
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setFolderEdit((prev) => {
                  const newValue = !prev
                  if (newValue) {
                    setTimeout(() => {
                      document.getElementById('folder')?.focus()
                    }, 0)
                  }
                  return newValue
                })
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-3">
            <p className="text-sm">
              {' '}
              {typeof errors.Day?.message === 'string'
                ? errors.Day.message
                : typeof errors.Folder?.message === 'string'
                  ? errors.Folder.message
                  : null}
            </p>
          </div>
        </div>
      </dd>
    </div>
  )
}

export default Name

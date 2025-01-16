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
    setValue('id', replaceTags(project.folder_template, tags))
  }, [daywatch, datewatch, unitwatch])

  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium leading-6 text-white"></dt>
      <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
        <div className="flex gap-10 mb-10">
          <FormField
            control={control}
            name="day"
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
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input type="text" className="w-32" {...field} />
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
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel>Log Name</FormLabel>
              <div className="flex gap-2 w-full max-w-sm">
                <FormControl>
                  <Input id="id" type="text" disabled={!folderEdit} className="" {...field} />
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

        {/*<div className="flex flex-col gap-1.5">
          <Label htmlFor="id">Log Name</Label>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              id="id"
              disabled={!folderEdit}
              type="text"
              className={errors.Folder ? 'border-red-500' : ''}
              {...register('id')}
            />
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
        </div>*/}
      </dd>
    </div>
  )
}

export default Name

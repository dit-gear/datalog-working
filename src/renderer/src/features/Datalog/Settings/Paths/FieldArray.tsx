import { Button } from '@components/ui/button'
import { Pencil } from 'lucide-react'
import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { useFieldArray, useFormContext } from 'react-hook-form'

interface FieldArrayProps {
  scope: 'project' | 'global'
  type: 'ocf' | 'sound'
}

export const FieldArray = ({ scope, type }: FieldArrayProps) => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${scope}_default_${type}_paths`
  })

  const handleAddPath = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getFolderPath()
      if (res.success) {
        append(res.data)
      } else console.log(res.error)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
      <ul
        key={`${scope}_ul`}
        role="list"
        className={`divide-y divide-white/10 rounded-md border border-white/20 mb-2 ${fields.length === 0 && 'hidden'}`}
      >
        {fields.map((field, index) => (
          <li
            key={`${scope}_${type}_${field.id}`}
            className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
          >
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2 items-center">
                <span className="flex-shrink-0 text-gray-400">{index + 1}:</span>

                <FormField
                  control={control}
                  name={`${scope}_default_${type}_paths.${index}`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          id={`${scope}_default_${type}_paths.${index}`}
                          type="text"
                          {...field}
                          className="block w-full bg-zinc-950 border-0 py-1.5 hover:text-white focus:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none sm:text-sm sm:leading-6"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeout(() => {
                    document.getElementById(`${scope}_default_${type}_paths.${index}`)?.focus()
                  }, 1)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center space-x-2">
        <Button type="button" onClick={handleAddPath}>
          Add Path
        </Button>
      </div>
    </dd>
  )
}

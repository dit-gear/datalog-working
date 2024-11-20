import { ReactElement } from 'react'
import { CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { formSchemaType } from '../types'
import { useFieldArray, useWatch, useFormContext } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { FormField, FormItem, FormControl } from '@components/ui/form'

interface PathsTabProps {
  scope: 'project' | 'global'
}

const Paths = ({ scope }: PathsTabProps): ReactElement => {
  const { control, setValue, register } = useFormContext<formSchemaType>()
  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-ignore (issue with react-hook-form and ts)
    name: `${scope}_default_ocf_paths`
  })

  const watch = useWatch({ control, name: `${scope}_default_proxies_path` })

  const handleAddOcfPath = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getFolderPath()
      if (res.success) {
        // @ts-ignore
        append(res.data)
      } else console.log(res.error)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddProxiesPath = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getFolderPath()
      if (res.success) {
        setValue(`${scope}_default_proxies_path`, res.data)
      } else console.log(res.error)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <CardContent>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Default OCF paths</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3">
          <ul
            key={`${scope}_ul`}
            role="list"
            className={`divide-y divide-white/10 rounded-md border border-white/20 mb-2 ${fields.length === 0 && 'hidden'}`}
          >
            {fields.map((field, index) => (
              <li
                key={`${scope}_${field.id}`}
                className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
              >
                <div className="flex w-0 flex-1 items-center">
                  <div className="ml-4 flex min-w-0 flex-1 gap-2 items-center">
                    <span className="flex-shrink-0 text-gray-400">{index + 1}:</span>

                    <FormField
                      control={control}
                      name={`${scope}_default_ocf_paths.${index}`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              id={`${scope}_default_ocf_paths.${index}`}
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
                        document.getElementById(`${scope}_default_ocf_paths.${index}`)?.focus()
                      }, 1)
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-indigo-400 hover:text-indigo-300"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-2">
            <Button type="button" variant="secondary" onClick={handleAddOcfPath}>
              Add Path
            </Button>
          </div>
        </dd>
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Default Proxies Path</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex justify-between items-center mr-5">
          {watch ? (
            <>
              <Input
                id="proxiesPath"
                type="text"
                className="block w-full bg-zinc-950 border-0 py-1.5 hover:text-white focus:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none sm:text-sm sm:leading-6"
                {...register('project_default_proxies_path')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimeout(() => {
                    document.getElementById('proxiesPath')?.focus()
                  }, 1)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-indigo-400 hover:text-indigo-300"
                onClick={() => setValue('project_default_proxies_path', '')}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" onClick={handleAddProxiesPath}>
              Add Path
            </Button>
          )}
        </dd>
      </div>
    </CardContent>
  )
}

export default Paths

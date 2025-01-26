import { ReactElement } from 'react'
import { CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { formSchemaType } from '../types'
import { useFieldArray, useWatch, useFormContext } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { FieldArray } from './FieldArray'
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

  const watch = useWatch({ control, name: `${scope}_default_proxy_path` })

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
        setValue(`${scope}_default_proxy_path`, res.data)
      } else console.log(res.error)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <CardContent>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Default OCF paths</dt>
        <FieldArray scope={scope} type="ocf" />
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Default Sound paths</dt>
        <FieldArray scope={scope} type="sound" />
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
                {...register('project_default_proxy_path')}
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
                variant="destructive"
                size="sm"
                onClick={() => setValue('project_default_proxy_path', '')}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button type="button" onClick={handleAddProxiesPath}>
              Add Path
            </Button>
          )}
        </dd>
      </div>
    </CardContent>
  )
}

export default Paths

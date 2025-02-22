import { ReactElement } from 'react'
import { CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { formSchemaType } from '../types'
import { useWatch, useFormContext } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { FieldArray } from './FieldArray'
import { Plus } from 'lucide-react'
import FormRow from '@components/FormRow'
interface PathsTabProps {
  scope: 'project' | 'global'
}

const Paths = ({ scope }: PathsTabProps): ReactElement => {
  const { control, setValue, register } = useFormContext<formSchemaType>()

  const watch = useWatch({ control, name: `${scope}_default_proxy_path` })

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
      <FormRow label="Default OCF Paths">
        <FieldArray scope={scope} type="ocf" />
      </FormRow>
      <FormRow label="Default Sound Paths">
        <FieldArray scope={scope} type="sound" />
      </FormRow>
      <FormRow label="Default Proxies Path">
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:mt-0 flex justify-between items-center mr-5">
          {watch ? (
            <>
              <Input
                id="proxiesPath"
                type="text"
                className="block w-full bg-zinc-950 border-0 py-1.5 hover:text-white focus:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none sm:text-sm sm:leading-6"
                {...register('project_default_proxy_path')}
              />
              <div className="flex gap-2">
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
              </div>
            </>
          ) : (
            <Button type="button" onClick={handleAddProxiesPath}>
              <Plus className="mr-2 h-4 w-4" />
              Add Path
            </Button>
          )}
        </dd>
      </FormRow>
    </CardContent>
  )
}

export default Paths

import { useFieldArray, useFormContext } from 'react-hook-form'
import { formSchemaType } from '../types'
import { fieldType } from '@shared/projectTypes'
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormDescription,
  FormMessage
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { useEffect } from 'react'

interface SubfieldArrayProps {
  type: fieldType
  scope: 'project' | 'global'
  parentIndex: number
}

const SubfieldArray: React.FC<SubfieldArrayProps> = ({ type, scope, parentIndex }) => {
  const {
    control,
    formState: { errors }
  } = useFormContext<formSchemaType>()
  const { fields, append, remove } = useFieldArray({
    control, // control prop comes from useForm or FormProvider
    name: `${scope}_additional_parsing.fields.${parentIndex}.subfields` // unique name for your Field Array
  })

  const subfieldErrors = errors.project_additional_parsing?.fields?.[parentIndex]?.subfields

  useEffect(() => {
    if (type !== 'object') {
      remove()
    } else if (fields.length === 0) {
      append({ value_key: '' })
    }
  }, [type])

  if (type === 'object') {
    return (
      <>
        <div className="divide-y divide-white/10 rounded-md border border-white/20 mb-2 mx-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-10 justify-between py-4 pl-4 pr-5 text-sm leading-6"
            >
              <FormField
                control={control}
                name={`${scope}_additional_parsing.fields.${parentIndex}.subfields.${index}.value_key`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Value Key</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-500 italic">
                      <FormMessage />
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormItem className="w-full">
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder={`[${index}]`} />
                </FormControl>
              </FormItem>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length < 2}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex mx-4 mb-5">
          <FormMessage>{subfieldErrors?.message}</FormMessage>
          <Button className="ml-auto" onClick={() => append({ value_key: '' })}>
            Add Key
          </Button>
        </div>
      </>
    )
  } else return null
}

export default SubfieldArray

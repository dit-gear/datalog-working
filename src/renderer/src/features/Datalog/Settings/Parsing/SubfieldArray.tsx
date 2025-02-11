import { useFieldArray, useFormContext, FieldError } from 'react-hook-form'
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
    name: `${scope}_custom_fields.fields.${parentIndex}.subfields` // unique name for your Field Array
  })

  const subfieldErrors: FieldError | undefined =
    errors.project_custom_fields?.fields?.[parentIndex] &&
    'subfields' in errors.project_custom_fields?.fields?.[parentIndex]
      ? (errors.project_custom_fields?.fields?.[parentIndex].subfields as FieldError)
      : undefined

  useEffect(() => {
    if (type !== 'list_of_mapped_objects') {
      remove()
    } else if (fields.length === 0) {
      append({ value_key: '' })
    }
  }, [type])

  if (type === 'list_of_mapped_objects') {
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
                name={`${scope}_custom_fields.fields.${parentIndex}.subfields.${index}.value_key`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Key</FormLabel>
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

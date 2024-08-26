import React from 'react'
import { CardDescription } from '@components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Button } from '@components/ui/button'
import ParsingField from './ParsingField'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { schemaType } from './settings'

interface ParsingWrapperProps {
  scope: 'project' | 'global'
}

const ParsingWrapper: React.FC<ParsingWrapperProps> = ({ scope }) => {
  const { control } = useFormContext<schemaType>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${scope}_additional_parsing.fields`
  })
  return (
    <>
      <dt className="text-sm font-medium leading-6 text-white">
        <CardDescription>
          Inspect your CSV file, assign the CSV headers to the right field. Clip name must match
          imported clip to be parsed. You can optionally add regex to refine the parsing.
        </CardDescription>
      </dt>
      <div
        key={`${scope}_csv_clip`}
        className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3"
      >
        <div className="divide-y divide-white/10 rounded-md border border-white/20 mb-2">
          <div className="grid grid-cols-6 items-center py-4 pl-4 pr-5 text-sm leading-6">
            <Label>Clip</Label>
            <div className="col-span-5 flex space-x-2 gap-6 justify-between">
              <FormField
                control={control}
                name={`${scope}_additional_parsing.clip.field`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 flex">
                <FormField
                  control={control}
                  name={`${scope}_additional_parsing.clip.regex`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regex</FormLabel>
                      <FormControl>
                        <Input {...field} className="max-w-64" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <dt className="text-sm font-medium leading-6 text-white">Additional Fields</dt>
      <dd
        key={`${scope}_csv_fields`}
        className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-3"
      >
        <div className="divide-y divide-white/10 rounded-md border border-white/20 mb-2 empty:hidden">
          {fields.map((field, index) => (
            <ParsingField
              scope={scope}
              key={`${scope}_${field.id}`}
              field={field}
              index={index}
              remove={remove}
            />
          ))}
        </div>
        <Button onClick={() => append({ name: '', field: '', options: { type: 'string' } })}>
          Add field
        </Button>
      </dd>
    </>
  )
}

export default ParsingWrapper

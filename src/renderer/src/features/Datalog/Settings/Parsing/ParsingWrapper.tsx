import React, { useState } from 'react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import ParsingField from './ParsingField'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { formSchemaType } from '../types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@components/ui/dropdown-menu'
import { MoreHorizontal, Info, Plus } from 'lucide-react'

interface ParsingWrapperProps {
  scope: 'project' | 'global'
}

const ParsingWrapper: React.FC<ParsingWrapperProps> = ({ scope }) => {
  const [showRegex, setShowRegex] = useState<boolean>(false)
  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${scope}_custom_fields.fields`
  })
  return (
    <>
      <dd key={`${scope}_csv_fields`} className="text-sm leading-6 text-gray-400 sm:mt-0">
        <div className="divide-y divide-white/10 rounded-md py-4 px-8 mt-4 mb-2  border border-white/20 empty:hidden">
          <div>
            <div className="flex gap-10 justify-between text-sm leading-6">
              <FormItem className="w-full">
                <FormLabel>Key</FormLabel>
                <Input placeholder="clip" disabled={true} />
              </FormItem>
              <FormField
                control={control}
                name={`${scope}_custom_fields.clip.column`}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>CSV Column Name for Clip Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon" className="p-3" variant="ghost">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuCheckboxItem
                      checked={showRegex}
                      onCheckedChange={(v) => setShowRegex(v)}
                    >
                      Regex
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {showRegex ? (
              <FormField
                control={control}
                name={`${scope}_custom_fields.clip.regex`}
                render={({ field }) => (
                  <FormItem className="w-64 mt-4">
                    <FormLabel>Value Extraction Regex (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <div className="rounded-md bg-blue-950 p-4 my-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info aria-hidden="true" className="h-5 w-5 text-blue-200" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-200">
                    Enter the CSV column containing values that match the OCF clip names without
                    file extensions. This will be used for matching your CSV data with OCF data. You
                    can optionally add a regex to refine the values.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
        <div>
          <Button
            type="button"
            onClick={() => append({ value_key: '', column: '', type: 'string' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add field
          </Button>
        </div>
      </dd>
    </>
  )
}

export default ParsingWrapper

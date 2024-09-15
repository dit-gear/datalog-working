import { useState } from 'react'
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@components/ui/dropdown-menu'
import DurationFields from './DurationFields'
import { MoreHorizontal } from 'lucide-react'
import { FieldArrayWithId, UseFieldArrayRemove, useFormContext, useWatch } from 'react-hook-form'
import { formSchemaType } from '../types'
import { fieldType, additionalParsing } from '@shared/projectTypes'
import SubfieldArray from './SubfieldArray'

interface ParsingFieldProps {
  scope: 'project' | 'global'
  field: FieldArrayWithId<additionalParsing, 'fields', 'id'>
  index: number
  remove: UseFieldArrayRemove
}

const ParsingField: React.FC<ParsingFieldProps> = ({ scope, field, index, remove }) => {
  const { control, setValue } = useFormContext<formSchemaType>()
  const activeType = useWatch({
    control,
    name: `${scope}_additional_parsing.fields.${index}.options.type`
  })
  const activeName = useWatch({
    control,
    name: `${scope}_additional_parsing.fields.${index}.value_key`
  })
  const [showRegex, setShowRegex] = useState((field.options?.regex?.length ?? 0) > 0)

  const fields = useWatch({ control, name: `${scope}_additional_parsing.fields` })
  const durationExists = fields?.some(
    (field, i) => i !== index && field.options?.type === 'duration'
  )

  const handleTypeChange = (type: string): void => {
    if (type !== 'string') {
      setValue(`${scope}_additional_parsing.fields.${index}.options.regex`, '')
    }
    if (type === 'duration') {
      setValue(`${scope}_additional_parsing.fields.${index}.value_key`, 'duration')
    } else if (activeName === 'duration') {
      setValue(`${scope}_additional_parsing.fields.${index}.value_key`, '')
    }
    setValue(`${scope}_additional_parsing.fields.${index}.options.type`, type as fieldType)
  }

  return (
    <div key={field.id}>
      <div className="flex -mb-4">
        <p className="ml-auto mr-2 capitalize">{activeType}</p>
      </div>
      <div className="flex gap-10 justify-between py-4 pl-4 pr-5 text-sm leading-6">
        <FormField
          control={control}
          name={`${scope}_additional_parsing.fields.${index}.value_key`}
          disabled={activeType === 'duration'}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Value Key</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${scope}_additional_parsing.fields.${index}.column`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="">CSV Column Name</FormLabel>
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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="mr-2 h-4 w-4">{''}</span>Type
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <FormField
                      control={control}
                      name={`${scope}_additional_parsing.fields.${index}.options.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DropdownMenuRadioGroup
                              value={field.value}
                              onValueChange={handleTypeChange}
                            >
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Primitive Types</DropdownMenuLabel>
                                <DropdownMenuRadioItem value="string">String</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="array">Array</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="object">
                                  Objects with keys
                                </DropdownMenuRadioItem>
                              </DropdownMenuGroup>

                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Special Types</DropdownMenuLabel>
                                <DropdownMenuRadioItem
                                  value="duration"
                                  disabled={durationExists && activeType !== 'duration'}
                                >
                                  Duration
                                </DropdownMenuRadioItem>
                              </DropdownMenuGroup>
                            </DropdownMenuRadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuCheckboxItem
                checked={showRegex}
                disabled={activeType === 'array' || activeType === 'object'}
                onCheckedChange={(v) => {
                  setShowRegex(v),
                    setValue(`${scope}_additional_parsing.fields.${index}.options.regex`, '')
                }}
              >
                Regex
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remove(index)}>
                <span className="mr-2 h-4 w-4">{''}</span>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {activeType === 'duration' ? <DurationFields scope={scope} index={index} /> : null}
      {showRegex ? (
        <FormField
          control={control}
          name={`${scope}_additional_parsing.fields.${index}.options.regex`}
          render={({ field }) => (
            <FormItem className="w-64 m-4">
              <FormLabel className="">Value Extraction Regex (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
      <SubfieldArray type={activeType} scope={scope} parentIndex={index} />
    </div>
  )
}

export default ParsingField

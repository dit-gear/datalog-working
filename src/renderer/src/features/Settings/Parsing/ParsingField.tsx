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
import {
  fieldType,
  Field,
  primitiveTypesZod,
  specialTypesZod,
  additionalParsing,
  StringFieldType,
  ListOfStringsFieldType,
  KeyValueObjFieldType,
  ListOfFieldArraysFieldType,
  ListOfMappedObjectsFieldType,
  DurationFieldType,
  delimiters
} from '@shared/projectTypes'
import SubfieldArray from './SubfieldArray'

interface ParsingFieldProps {
  scope: 'project' | 'global'
  field: FieldArrayWithId<additionalParsing, 'fields', 'id'>
  index: number
  remove: UseFieldArrayRemove
}

const ParsingField: React.FC<ParsingFieldProps> = ({ scope, field, index, remove }) => {
  const { control, setValue, getValues } = useFormContext<formSchemaType>()
  const activeType = useWatch({
    control,
    name: `${scope}_additional_parsing.fields.${index}.type`
  })
  const [showRegex, setShowRegex] = useState('regex' in field)

  const fields = useWatch({ control, name: `${scope}_additional_parsing.fields` })

  const primitiveDropdownItems = primitiveTypesZod.options.map((type) => ({
    value: type,
    label: type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) // Format the label
  }))

  const specialDropdownItems = specialTypesZod.options.map((type) => ({
    value: type,
    label: type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    disabled: activeType !== type && fields?.some((field, i) => i !== index && field.type === type)
  }))

  const delimiterLabels: { [key: string]: string } = {
    ',': 'Comma',
    ';': 'Semicolon',
    '|': 'Pipe',
    ':': 'Colon',
    '=': 'Equals Sign'
  }

  const delimiterDropdownItems = delimiters.options.map((option) => ({
    value: option,
    label: delimiterLabels[option]
  }))

  const handleTypeChange = (type: fieldType): void => {
    const currentField = getValues(`${scope}_additional_parsing.fields.${index}`)

    switch (type) {
      case 'string':
        setValue(
          `${scope}_additional_parsing.fields.${index}`,
          {
            type: 'string',
            value_key: 'value_key' in currentField ? currentField.value_key : '',
            column: 'column' in currentField ? currentField.column : '',
            regex: 'regex' in currentField ? currentField.regex : ''
          },
          { shouldValidate: true }
        )
        break

      case 'list_of_strings':
        setShowRegex(false)
        setValue(
          `${scope}_additional_parsing.fields.${index}`,
          {
            type: 'list_of_strings',
            value_key: 'value_key' in currentField ? currentField.value_key : '',
            column: 'column' in currentField ? currentField.column : '',
            delimiter: 'delimiter' in currentField ? currentField.delimiter : ','
          },
          { shouldValidate: true }
        )
        break

      case 'key-value_object':
        setShowRegex(false)
        setValue(
          `${scope}_additional_parsing.fields.${index}`,
          {
            type: 'key-value_object',
            value_key: 'value_key' in currentField ? currentField.value_key : '',
            column: 'column' in currentField ? currentField.column : '',
            primary_delimiter:
              'primary_delimiter' in currentField ? currentField.primary_delimiter : ';',
            secondary_delimiter:
              'secondary_delimiter' in currentField ? currentField.secondary_delimiter : ':'
          },
          { shouldValidate: true }
        )
        break

      case 'list_of_field_arrays':
        setShowRegex(false)
        setValue(
          `${scope}_additional_parsing.fields.${index}`,
          {
            type: 'list_of_field_arrays',
            value_key: 'value_key' in currentField ? currentField.value_key : '',
            column: 'column' in currentField ? currentField.column : '',
            primary_delimiter:
              'primary_delimiter' in currentField ? currentField.primary_delimiter : ',',
            secondary_delimiter:
              'secondary_delimiter' in currentField ? currentField.secondary_delimiter : '|'
          },
          { shouldValidate: true }
        )
        break

      case 'list_of_mapped_objects':
        setShowRegex(false)
        setValue(`${scope}_additional_parsing.fields.${index}`, {
          type: 'list_of_mapped_objects',
          value_key: 'value_key' in currentField ? currentField.value_key : '',
          column: 'column' in currentField ? currentField.column : '',
          subfields: 'subfields' in currentField ? currentField.subfields : [{ value_key: '' }],
          primary_delimiter:
            'primary_delimiter' in currentField ? currentField.primary_delimiter : ',',
          secondary_delimiter:
            'secondary_delimiter' in currentField ? currentField.secondary_delimiter : '|'
        })
        break

      case 'duration':
        setShowRegex(false)
        setValue(
          `${scope}_additional_parsing.fields.${index}`,
          {
            type: 'duration',
            column: 'column' in currentField ? currentField.column : '',
            unit: 'unit' in currentField ? currentField.unit : 'ms',
            fps: 'fps' in currentField ? currentField.fps : ''
          },
          { shouldValidate: true }
        )
        break

      default:
        console.warn('Unknown type:', type)
        return
    }
  }

  return (
    <div key={field.id}>
      <div className="flex -mb-4">
        <p className="ml-auto mr-2 capitalize">
          {activeType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
        </p>
      </div>
      <div className="flex gap-10 justify-between py-4 pl-4 pr-5 text-sm leading-6">
        {activeType === 'duration' ? (
          <FormItem className="w-full">
            <FormLabel>Value Key</FormLabel>
            <FormControl>
              <Input disabled placeholder="Duration" />
            </FormControl>
            <FormMessage />
          </FormItem>
        ) : (
          <FormField
            control={control}
            name={`${scope}_additional_parsing.fields.${index}.value_key`}
            //disabled={specialDropdownItems.some((item) => item.value === activeType)}
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
        )}
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
                      name={`${scope}_additional_parsing.fields.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DropdownMenuRadioGroup
                              value={field.value}
                              onValueChange={(v) => handleTypeChange(v as fieldType)}
                            >
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Primitive Types</DropdownMenuLabel>
                                {primitiveDropdownItems.map((item) => (
                                  <DropdownMenuRadioItem value={item.value}>
                                    {item.label}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuGroup>

                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Special Types</DropdownMenuLabel>
                                {specialDropdownItems.map((item) => (
                                  <DropdownMenuRadioItem
                                    value={item.value}
                                    disabled={item.disabled}
                                  >
                                    {item.label}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuRadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {activeType === 'list_of_strings' ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span className="mr-2 h-4 w-4">{''}</span>Delimiter
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <FormField
                        control={control}
                        name={`${scope}_additional_parsing.fields.${index}.delimiter`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <DropdownMenuRadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                {delimiterDropdownItems.map((item) => (
                                  <DropdownMenuRadioItem key={item.value} value={item.value}>
                                    <span className="mr-1 ml-2 w-4">{item.value}</span>
                                    <span>{item.label}</span>
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ) : null}
              {activeType === 'key-value_object' ||
              activeType === 'list_of_field_arrays' ||
              activeType === 'list_of_mapped_objects' ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span className="mr-2 h-4 w-4">{''}</span>Delimiters
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Primary Delimiter</DropdownMenuLabel>
                        <FormField
                          control={control}
                          name={`${scope}_additional_parsing.fields.${index}.primary_delimiter`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <DropdownMenuRadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  {delimiterDropdownItems.map((item) => (
                                    <DropdownMenuRadioItem
                                      key={item.value}
                                      value={item.value}
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <span className="mr-1 ml-2 w-4">{item.value}</span>
                                      <span>{item.label}</span>
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Secondary Delimiter</DropdownMenuLabel>
                        <FormField
                          control={control}
                          name={`${scope}_additional_parsing.fields.${index}.secondary_delimiter`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <DropdownMenuRadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  {delimiterDropdownItems.map((item) => (
                                    <DropdownMenuRadioItem
                                      key={item.value}
                                      value={item.value}
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <span className="mr-1 ml-2 w-4">{item.value}</span>
                                      <span>{item.label}</span>
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </DropdownMenuGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ) : null}

              <DropdownMenuCheckboxItem
                checked={showRegex}
                disabled={activeType !== 'string'}
                onCheckedChange={(v) => {
                  setShowRegex(v), setValue(`${scope}_additional_parsing.fields.${index}.regex`, '')
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
          name={`${scope}_additional_parsing.fields.${index}.regex`}
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

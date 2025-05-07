import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { valueTypes } from './Data'
import { useRef, useEffect } from 'react'
import { EditingCellType } from './types'

const calculateWidth = (value = '', minChars = 1, maxChars = 50, extraChars = 2) => {
  const length = value.length
  const clampedLength = Math.min(Math.max(length, minChars), maxChars)
  return `${clampedLength + extraChars}ch`
}

interface FormCellProps {
  rowIndex: number
  column: any
  value: valueTypes
  totalRows: number
  handleSave: (value: string, nextCell: EditingCellType) => void
  //onBlur: (next: EditingCellType) => void // <-- New optional prop
}

const FormCell = ({ rowIndex, column, value, totalRows, handleSave }: FormCellProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      cell: value.value
    }
  })
  const { control, handleSubmit } = form

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onSubmit = (data, nextEditing: EditingCellType) => {
    //setValue(`${value.path}.${column.id}`, data.cell)
    //onBlur(nextEditing)
    handleSave(data.cell, nextEditing)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      console.log('pressed')

      const nextRowIndex: number = e.shiftKey
        ? (rowIndex - 1 + totalRows) % totalRows
        : (rowIndex + 1) % totalRows

      const nextEditing: EditingCellType = { rowIndex: nextRowIndex, colId: column.id }
      handleSubmit((data) => onSubmit(data, nextEditing))()
    }
  }

  return (
    <FormField
      name="cell"
      control={control}
      render={({ field }) => {
        const inputWidth = calculateWidth(field.value as string, 5, 60, 4)

        return (
          <FormItem className="inline-flex">
            <FormControl>
              <Input
                {...field}
                id={`${value.path}.${column.id}`}
                type={typeof value.value}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onBlur={handleSubmit((data) => onSubmit(data, null))}
                className="-ml-2 h-auto border-none transition-width duration-200 hover:bg[inherit]"
                style={{ width: inputWidth }}
              />
            </FormControl>
          </FormItem>
        )
      }}
    />
  )
}

export default FormCell

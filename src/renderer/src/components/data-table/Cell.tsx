import { FormField, FormItem, FormControl } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { useFormContext } from 'react-hook-form'

const calculateWidth = (value = '', minChars = 1, maxChars = 50, extraChars = 2) => {
  const length = value.length
  const clampedLength = Math.min(Math.max(length, minChars), maxChars)
  return `${clampedLength + extraChars}ch`
}

const Cell = ({ row, column, totalRows }) => {
  const { control } = useFormContext()
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()

      let nextRowIndex: number
      if (e.key === 'Tab' && e.shiftKey) {
        nextRowIndex = (row.index - 1 + totalRows) % totalRows
      } else {
        nextRowIndex = (row.index + 1) % totalRows
      }
      const nextInputId = `cell-${nextRowIndex}-${column.id}`
      const nextInput = document.getElementById(nextInputId)

      if (nextInput) {
        nextInput.focus()
      }
    }
  }
  //console.log('Field name:', `Clips.${row.id}.${column.id}`);

  return (
    <FormField
      name={`Clips.${row.id}.${column.id}`}
      control={control}
      render={({ field }) => {
        const inputWidth = calculateWidth(field.value, 5, 60, 2)
        return (
          <FormItem className="inline-flex">
            <FormControl>
              <Input
                {...field}
                id={`cell-${row.index}-${column.id}`}
                onKeyDown={handleKeyDown}
                className="-p-2 border-none transition-width duration-200 hover:bg[inherit]"
                style={{ width: inputWidth }}
              />
            </FormControl>
          </FormItem>
        )
      }}
    />
  )
}

export default Cell

import { forwardRef, Ref } from 'react'
import Select, { SelectInstance, GroupBase, MultiValue } from 'react-select'
import { selectStyles, Option } from './utils/MultiSelectUtils'

interface MultiSelectProps {
  value: Option[]
  onChange: (value: string[]) => void
  onBlur: () => void
  name: string
  options: Option[]
  placeholder?: string
  dataIndex: number
}

function MultiSelectInner(
  props: MultiSelectProps,
  ref: Ref<SelectInstance<Option, true, GroupBase<Option>>>
) {
  const { value = [], options, onChange, onBlur, name, placeholder = '', dataIndex } = props

  const handleChange = (selectedOptions: MultiValue<Option>) => {
    // Extract IDs from selected options
    const ids = selectedOptions.map((option) => option.value)
    onChange(ids) // Pass only IDs to parent
  }

  const nextElement = document.querySelector(`[data-index="${dataIndex + 2}"]`) as HTMLElement

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.key === 'Tab') {
      nextElement?.focus()
      event.preventDefault()
    }
  }

  return (
    <Select
      styles={selectStyles}
      isMulti
      onChange={handleChange}
      placeholder={placeholder}
      value={value}
      options={options}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      menuPosition="fixed"
      name={name}
      ref={ref}
      data-index={dataIndex}
    />
  )
}

const MultiSelect = forwardRef(MultiSelectInner)

MultiSelect.displayName = 'MultiSelect'

export default MultiSelect

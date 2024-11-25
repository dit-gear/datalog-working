import { KeyboardEventHandler, useState, forwardRef } from 'react'
import { SelectInstance, GroupBase } from 'react-select'
import { selectStyles, Option } from './utils/MultiSelectUtils'
import CreatableSelect from 'react-select/creatable'

interface MultiSelectTextInputProps {
  value: string[] | undefined
  onChange: (value: string[]) => void
  onBlur: () => void
  name: string
  placeholder?: string
  dataIndex: number
}

const MultiSelectTextInput = forwardRef<
  SelectInstance<Option, true, GroupBase<Option>>,
  MultiSelectTextInputProps
>(({ value = [], onChange, onBlur, name, placeholder = '', dataIndex }, ref) => {
  const [inputValue, setInputValue] = useState('')
  const nextElement = document.querySelector(`[data-index="${dataIndex + 2}"]`) as HTMLElement

  const handleKeyDown: KeyboardEventHandler = (event) => {
    switch (event.key) {
      case 'Tab':
        if (inputValue && !value.includes(inputValue)) {
          onChange([...(value || []), inputValue])
          setInputValue('')
        }
        if (!inputValue) nextElement?.focus()
        event.preventDefault()
        break

      case 'Enter':
      case ' ':
        if (inputValue && !value.includes(inputValue)) {
          onChange([...(value || []), inputValue])
          setInputValue('')
        }
        event.preventDefault()
        break
    }
  }

  const handleBlur = () => {
    if (inputValue && !value.includes(inputValue)) {
      onChange([...(value || []), inputValue])
      setInputValue('')
    }
    onBlur()
  }

  const handleCreate = (inputValue: string): void => {
    if (!value.includes(inputValue)) {
      onChange([...(value || []), inputValue])
    }
    setInputValue('')
  }

  const handleSelectChange = (newValue: readonly Option[]) => {
    onChange(newValue ? newValue.map((v) => v.value) : [])
  }

  return (
    <CreatableSelect
      styles={selectStyles}
      components={{ DropdownIndicator: null }}
      inputValue={inputValue}
      isClearable
      isMulti
      menuIsOpen={false}
      onChange={handleSelectChange}
      onCreateOption={handleCreate}
      onInputChange={(newValue, actionMeta) => {
        if (actionMeta.action !== 'input-blur' && actionMeta.action !== 'menu-close') {
          setInputValue(newValue)
        }
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      value={value.map((option) => ({ label: option, value: option }))}
      onBlur={handleBlur}
      name={name}
      ref={ref}
      data-index={dataIndex}
    />
  )
})

MultiSelectTextInput.displayName = 'MultiSelectTextInput'

export default MultiSelectTextInput

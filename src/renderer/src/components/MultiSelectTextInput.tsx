import { KeyboardEventHandler, useState, forwardRef } from 'react'
import { SelectInstance, GroupBase, StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

type Option = {
  label: string
  value: string
}

interface MultiSelectTextInputProps {
  value: string[] | undefined
  onChange: (value: string[]) => void
  onBlur: () => void
  name: string
  placeholder?: string
  dataIndex: number
}

const styles: StylesConfig<Option, true, GroupBase<Option>> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'hsl(var(--background))', // Dark background
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'none', // Border based on focus state
    color: 'hsl(var(--foreground))', // Text color
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'hsl(var(--popover))', // Dropdown background
    color: 'hsl(var(--popover-foreground))' // Dropdown text color
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
        ? 'hsl(var(--muted))'
        : 'hsl(var(--popover))',
    color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--popover-foreground))',
    '&:hover': {
      backgroundColor: 'hsl(var(--muted))'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))' // Selected option text color
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))' // Placeholder text color
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))', // Dropdown arrow color
    '&:hover': {
      color: 'hsl(var(--foreground))'
    }
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'hsl(var(--border))' // Separator color
  }),
  input: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))' // Input text color
  })
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
        if (!value.includes(inputValue)) {
          onChange([...(value || []), inputValue])
          setInputValue('')
        }
        event.preventDefault()
        break
    }
  }

  const handleChange = (newValue: readonly Option[]): void => {
    onChange(newValue ? newValue.map((v) => v.value) : [])
  }

  const handleCreate = (inputValue: string): void => {
    if (!value.includes(inputValue)) {
      onChange([...(value || []), inputValue])
    }
    setInputValue('')
  }

  return (
    <CreatableSelect
      styles={styles}
      components={{ DropdownIndicator: null }}
      inputValue={inputValue}
      isClearable
      isMulti
      menuIsOpen={false}
      onChange={handleChange}
      onCreateOption={handleCreate}
      onInputChange={(newValue, actionMeta) => {
        if (actionMeta.action !== 'input-blur' && actionMeta.action !== 'menu-close') {
          setInputValue(newValue)
        }
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      value={value.map((option) => ({ label: option, value: option }))}
      onBlur={onBlur}
      name={name}
      ref={ref}
      data-index={dataIndex}
    />
  )
})

MultiSelectTextInput.displayName = 'MultiSelectTextInput'

export default MultiSelectTextInput

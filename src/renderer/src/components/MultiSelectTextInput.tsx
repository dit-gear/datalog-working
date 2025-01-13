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
  dataIndex?: number
}

const isFocusable = (element: HTMLElement): boolean => {
  return (
    element.tabIndex >= 0 ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLButtonElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLAnchorElement
  )
}

const findNextFocusable = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null

  // Check if the current element is focusable
  if (isFocusable(element)) {
    return element
  }

  // Check the children of the current element
  for (const child of Array.from(element.children)) {
    const focusableChild = findNextFocusable(child as HTMLElement)
    if (focusableChild) {
      return focusableChild
    }
  }

  // If no focusable child, check the next sibling
  return findNextFocusable(element.nextElementSibling as HTMLElement)
}

const MultiSelectTextInput = forwardRef<
  SelectInstance<Option, true, GroupBase<Option>>,
  MultiSelectTextInputProps
>(({ value = [], onChange, onBlur, name, dataIndex, placeholder = '' }, ref) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown: KeyboardEventHandler = (event) => {
    switch (event.key) {
      case 'Tab':
        if (inputValue && !value.includes(inputValue)) {
          onChange([...(value || []), inputValue])
          setInputValue('')
          event.preventDefault()
          break
        }
        if (!inputValue && dataIndex) {
          const nextElement = document.querySelector(
            `[data-index="${dataIndex + 2}"]`
          ) as HTMLElement
          nextElement?.focus()
          event.preventDefault()
        }
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
      {...(dataIndex && { 'data-index': dataIndex })}
    />
  )
})

MultiSelectTextInput.displayName = 'MultiSelectTextInput'

export default MultiSelectTextInput

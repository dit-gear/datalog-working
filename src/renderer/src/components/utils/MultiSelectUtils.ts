import { StylesConfig, GroupBase } from 'react-select'

export type Option = {
  label: string
  value: string
}

export const selectStyles: StylesConfig<Option, true, GroupBase<Option>> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'hsl(var(--background))',
    borderColor: state.isFocused ? 'none' : 'none',
    '&:hover': {
      borderColor: 'none'
    },
    color: 'hsl(var(--foreground))',
    boxShadow: state.isFocused
      ? '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring))'
      : 'none',
    ':focus-visible': {
      '--tw-ring-offset-width': '2px',
      '--tw-ring-color': 'hsl(var(--ring))'
    },
    minHeight: '2.5rem',
    borderRadius: 'calc(var(--radius) - 2px)'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'hsl(var(--popover))',
    color: 'hsl(var(--popover-foreground))',
    border: '2px solid hsl(var(--border))',
    padding: '4px'
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
    },
    cursor: 'pointer',
    borderRadius: '5px'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))'
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': {
      color: 'hsl(var(--foreground))'
    },
    cursor: 'pointer'
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'hsl(var(--border))'
  }),
  input: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))',
    cursor: 'text'
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': {
      color: 'hsl(var(--foreground))'
    },
    cursor: 'pointer'
  })
}

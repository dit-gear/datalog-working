import * as React from 'react'

import { cn } from '@components/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, onChange, onKeyDown, ...props }, ref) => {
    const handleInternalKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle Cmd+A (or Ctrl+A) to select all text
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.currentTarget.select()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        const target = e.currentTarget
        const start = target.selectionStart ?? 0
        const end = target.selectionEnd ?? 0
        const value = target.value
        const selected = value.slice(start, end)
        window.electronClipboard.writeText(selected)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        const text = window.electronClipboard.readText()
        const target = e.currentTarget
        const start = target.selectionStart ?? 0
        const end = target.selectionEnd ?? 0
        const value = target.value
        const newValue = value.slice(0, start) + text + value.slice(end)
        e.preventDefault()
        if (onChange) {
          onChange({
            ...e,
            currentTarget: { ...target, value: newValue },
            target: { ...target, value: newValue }
          } as React.ChangeEvent<HTMLTextAreaElement>)
        } else {
          target.value = newValue
        }
      }
    }

    const handleKeyDown = (e) => {
      handleInternalKeyDown(e)

      if (onKeyDown) {
        onKeyDown(e)
      }
    }
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }

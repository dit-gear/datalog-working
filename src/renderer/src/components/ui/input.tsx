import * as React from 'react'

import { cn } from '@components/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onKeyDown, ...props }, ref) => {
    // Internal onKeyDown handler for Input component
    const handleInternalKeyDown = (e) => {
      // Handle Cmd+A (or Ctrl+A) to select all text
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.currentTarget.select()
      }
    }

    const handleKeyDown = (e) => {
      handleInternalKeyDown(e)

      if (onKeyDown) {
        onKeyDown(e)
      }
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown} // Use merged handler
        {...props}
      />
    )
  }
)

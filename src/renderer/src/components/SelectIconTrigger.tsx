import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Replace } from 'lucide-react'
import { cn } from '@components/lib/utils'

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex gap-2 h-7 w-full items-center justify-between rounded-md border border-input bg-background px-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Replace className="h-4 w-4" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export { SelectTrigger }

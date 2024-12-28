import * as React from 'react'
import { VariantProps, cva } from 'class-variance-authority'
import { XIcon, Dot } from 'lucide-react'

import { cn } from '@components/lib/utils'
import { Button } from '@components/ui/button'

const customTabVariants = cva(
  'inline-flex items-center justify-between whitespace-nowrap rounded-t-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-r-2 border-t-2 border-l-2 overflow-visible',
  {
    variants: {
      variant: {
        default: 'bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface CustomTabProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof customTabVariants> {
  action?: { onClick: () => void }
  isActive?: boolean
  isDirty?: boolean
}

const CustomTab = React.forwardRef<HTMLDivElement, CustomTabProps>(
  ({ className, variant, size, action, isActive, isDirty, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          customTabVariants({ variant, size }),
          isActive && 'bg-background text-accent-foreground hover:bg-background',
          'relative',
          className
        )}
        {...props}
      >
        <button
          className={cn(
            'flex items-center gap-2 flex-grow text-left',
            'transition-colors rounded-md px-2 py-1'
          )}
          //onClick={props.onClick}
          disabled={isActive}
        >
          <span className="truncate">{children}</span>
        </button>
        {isDirty ? (
          <Dot />
        ) : (
          action && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('ml-2 h-6 w-6 rounded-md')}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick()
              }}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )
        )}

        {isActive && (
          <span
            className="absolute -bottom-0 left-0 right-0 h-0.5 bg-background z-20"
            style={{ transform: 'translateY(100%)' }}
          />
        )}
      </div>
    )
  }
)
CustomTab.displayName = 'CustomTab'

export { CustomTab, customTabVariants }

/*
 <button
        ref={ref}
        className={cn(
          customTabVariants({ variant, size }),
          isActive && 'text-accent-foreground hover:bg-transparent',
          'relative',
          className
        )}
        disabled={isActive}
        {...props}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          <span className="truncate">{children}</span>
        </span>
        {action && <span className="ml-2 flex h-4 w-4 items-center justify-center">{action}</span>}
        {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-background" />}
      </button>
      */

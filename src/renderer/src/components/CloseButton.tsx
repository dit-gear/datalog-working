import React from 'react'
import { X } from 'lucide-react'

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ onClick, ...props }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      {...props}
      className="absolute right-4 top-4 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
)

CloseButton.displayName = 'CloseButton'

export default CloseButton

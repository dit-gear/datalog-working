import React from 'react'
import { Label } from '@components/ui/label'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import { useWatch } from 'react-hook-form'

interface SectionProps {
  type: 'ocf' | 'sound' | 'proxy' | 'custom'
  label: string
  disabled?: boolean
  handleRemoveClipsLocal?: () => void
  handleAddClips: (type: 'ocf' | 'sound' | 'proxy' | 'custom') => void
  children?: React.ReactNode
}

export const Section = ({ type, label, disabled, handleAddClips, children }: SectionProps) => {
  const clips = useWatch({ name: type === 'custom' ? 'custom' : `${type}.clips` })

  if (type === 'ocf' || type === 'sound') {
    return (
      <div key={type}>
        <Label htmlFor="sound-copies" className="text-base">
          {label}
        </Label>
        <p className="text-muted-foreground text-sm">{`${clips && clips.length > 0 ? clips.length : 'No'} clips added`}</p>
        {children}
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips(type)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Folder
          </Button>
        </div>
      </div>
    )
  } else if (type === 'proxy' || type === 'custom') {
    return (
      <div key={type}>
        <Label htmlFor={`${type}-copies`} className="text-base">
          {label}
        </Label>
        <p className="text-muted-foreground text-sm">
          {disabled
            ? 'Add Custom fields in app settings to enable this option'
            : `${clips && clips.length > 0 ? clips.length : 'No'} clips added`}
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips(type)} disabled={disabled}>
            <Plus className="mr-2 h-4 w-4" />
            {type === 'custom' ? 'Select CSV file' : 'Add Folder'}
          </Button>
          {clips && clips.length > 0 ? children : null}
        </div>
      </div>
    )
  } else {
    return null
  }
}

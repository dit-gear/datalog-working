import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { DurationPopupForm } from './forms/DurationPopupForm'
import Stat from '@components/stat'
import { formatDuration } from '@shared/utils/format-duration'

const Duration = () => {
  const { setValue } = useFormContext()
  const clips = useWatch({ name: 'clips' }) || []
  const fixedDuration = useWatch({ name: 'duration' }) as number | undefined

  const [value, setValueState] = useState<number>(0)
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null)
  const [defaults, setDefaults] = useState<number>(0)

  useEffect(() => {
    const computedDefaults = getDurationFromClips(clips)
    setDefaults(computedDefaults)

    const hasFixedValue = fixedDuration !== undefined && fixedDuration !== null && fixedDuration > 0
    const computedValue = hasFixedValue ? fixedDuration : computedDefaults
    setValueState(computedValue)

    const formattedDisplay = formatDurationDisplayValue(computedValue)
    setDisplayValue(formattedDisplay.displayValue)
  }, [clips, fixedDuration])

  const update = (newValue: number) => {
    setValue('duration', newValue)
  }

  const clear = () => {
    setValue('duration', undefined)
  }

  return (
    <DurationPopupForm value={value} defaults={defaults} update={update} clear={clear}>
      <Stat label="Duration">{displayValue}</Stat>
    </DurationPopupForm>
  )
}

const getDurationFromClips = (clips): number => {
  return clips.reduce((acc, clip) => acc + (clip.Duration || 0), 0) || 0
}

const formatDurationDisplayValue = (duration: number) => {
  if (!duration || duration === 0) {
    return { displayValue: null }
  }
  const { hours, minutes } = formatDuration(duration)
  return {
    displayValue: (
      <>
        {hours ? (
          <>
            <span className="text-4xl font-semibold leading-none tracking-tight text-white">
              {hours}
            </span>
            <span className="text-sm text-gray-400">h</span>
          </>
        ) : null}
        {minutes ? (
          <>
            <span className="text-4xl font-semibold tracking-tight text-white">{minutes}</span>
            <span className="text-sm text-gray-400">min</span>
          </>
        ) : null}
      </>
    )
  }
}

export default Duration

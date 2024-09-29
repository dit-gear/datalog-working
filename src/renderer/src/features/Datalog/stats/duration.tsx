import useStats from './use-stats'
import { DurationPopupForm } from './forms/DurationPopupForm'
import Stat from '@components/stat'
import { formatDuration } from '@renderer/utils/format-duration'

const getDurationFromClips = (clips) => clips.reduce((acc, clip) => acc + (clip.Duration || 0), 0)

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

const Duration = () => {
  const { value, displayValue, update, defaults, clear } = useStats<number>({
    fixedValueName: 'Duration',
    computeValueFromClips: getDurationFromClips,
    formatDisplayValue: formatDurationDisplayValue
  })

  return (
    <DurationPopupForm value={value} defaults={defaults} update={update} clear={clear}>
      <Stat label="Duration">{displayValue}</Stat>
    </DurationPopupForm>
  )
}

export default Duration

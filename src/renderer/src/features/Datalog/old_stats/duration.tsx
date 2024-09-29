import Stat from '@components/stat'
import { useFormContext, useWatch } from 'react-hook-form'
import { formatDuration } from '@renderer/utils/format-duration'
import { ClipType } from '@shared/datalogTypes'
import { DurationPopupForm } from '@components/DurationPopupForm'

const getDuration = (clips: ClipType[]): number =>
  clips.reduce((acc, clip) => acc + (clip.Duration || 0), 0)

const Duration = () => {
  const { setValue } = useFormContext()
  const clips: ClipType[] = useWatch({ name: 'Clips' })
  const fixedDuration = useWatch({ name: 'Duration' })
  const duration = fixedDuration ? fixedDuration : getDuration(clips)

  const update = (newValue: number) => {
    setValue('Duration', newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }
  const { hours, minutes } = formatDuration(duration)
  return (
    <DurationPopupForm value={duration} update={update}>
      <Stat label="Duration">
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
      </Stat>
    </DurationPopupForm>
  )
}

export default Duration

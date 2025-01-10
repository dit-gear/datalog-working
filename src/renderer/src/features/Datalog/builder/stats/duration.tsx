import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { DurationPopupForm } from './forms/DurationPopupForm'
import Stat from '@components/stat'
import { getDuration } from '@shared/utils/datalog-methods'
import { durationType } from '@shared/shared-types'
import { DurationStat } from './duration/durationStat'
import { formatDuration } from '@shared/utils/format-duration'

const Duration = () => {
  const { setValue } = useFormContext()
  const clips = useWatch({ name: 'ocf.clips' })
  const fixedDuration = useWatch({ name: 'ocf.duration' })

  const [value, setValueState] = useState<durationType>()
  const [defaults, setDefaults] = useState<durationType>()

  useEffect(() => {
    if (clips || fixedDuration) {
    }
    console.log('d-clips', clips)
    const duration = getDuration(
      {
        duration: fixedDuration ? fixedDuration : undefined,
        clips
      },
      'hms'
    )
    const durationDefaults = getDuration({ clips: clips }, 'hms')
    setDefaults(durationDefaults)
    setValueState(duration)
  }, [clips, fixedDuration])

  const update = (newValue: string) => {
    setValue('ocf.duration', newValue, { shouldDirty: true })
  }

  const clear = () => {
    setValue('ocf.duration', '')
  }

  return (
    <DurationPopupForm value={value} defaults={defaults} update={update} clear={clear}>
      <DurationStat duration={value} />
    </DurationPopupForm>
  )
}

export default Duration

import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { DurationPopupForm } from '../forms/DurationPopupForm'
import { getDuration } from '@shared/utils/datalog-methods'
import { DurationType } from '@shared/shared-types'
import { DurationStat } from './durationStat'

const Duration = () => {
  const { setValue } = useFormContext()
  const clips = useWatch({ name: 'ocf.clips' })
  const fixedDuration = useWatch({ name: 'ocf.duration' })

  const [value, setValueState] = useState<DurationType | null>(null)

  useEffect(() => {
    const duration = getDuration(
      {
        duration: fixedDuration ? fixedDuration : undefined,
        clips
      },
      'hms'
    )
    setValueState(duration)
  }, [clips, fixedDuration])

  const update = (newValue: string) => {
    setValue('ocf.duration', newValue)
  }

  const clear = () => {
    setValue('ocf.duration', null)
  }

  return (
    <DurationPopupForm value={value} update={update} clear={clear}>
      <DurationStat value={value} />
    </DurationPopupForm>
  )
}

export default Duration

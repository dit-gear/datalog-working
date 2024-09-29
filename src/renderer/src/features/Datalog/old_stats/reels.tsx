import { useState, useEffect } from 'react'
import Stat from '@components/stat'
import { useFormContext, useWatch } from 'react-hook-form'
import { ClipType } from '@shared/datalogTypes'
import { getReels } from '@renderer/utils/format-reel'
import { ReelsPopupForm } from './forms/ReelsPopupForm'

type ReelsStatsType = {
  value: string
  displayValue: string
  font: '4xl' | '3xl' | '2xl' | 'xl'
}

const Reels = () => {
  const [stats, setStats] = useState<ReelsStatsType>()
  const { setValue } = useFormContext()
  const clips: ClipType[] = useWatch({ name: 'Clips' })
  const fixedReels: string[] = useWatch({ name: 'Reels' })

  useEffect(() => {
    const val = fixedReels.length > 0 ? fixedReels : clips
    const value = getReels(val).join(', ')
    const displayValue = getReels(val, { grouped: true }).join(', ')
    const font = val.length < 20 ? '4xl' : val.length < 30 ? '3xl' : val.length < 40 ? '2xl' : 'xl'

    setStats({
      value,
      displayValue,
      font
    })
  }, [clips, fixedReels])

  const update = (newValue: string[]) => {
    setValue('Reels', newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }

  return (
    <ReelsPopupForm value={stats?.value || ''} update={update}>
      <Stat label="Reels">
        <span
          className={`text-${stats?.font} font-semibold leading-none tracking-tight text-white line-clamp-3`}
        >
          {stats?.displayValue}
        </span>
      </Stat>
    </ReelsPopupForm>
  )
}

export default Reels

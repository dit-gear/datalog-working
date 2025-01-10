import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ReelsPopupForm } from './forms/ReelsPopupForm'
import { getReels } from '@shared/utils/datalog-methods'
import Stat from '@components/stat'
import { OcfClipType } from '@shared/datalogTypes'

const formatReelsDisplayValue = (reels: string[]) => {
  if (!reels || reels.length === 0) {
    return { displayValue: null }
  }
  const displayValueStr = reels.join(', ')
  const fontClass =
    displayValueStr.length < 20
      ? 'text-4xl'
      : displayValueStr.length < 30
        ? 'text-3xl'
        : displayValueStr.length < 40
          ? 'text-2xl'
          : 'text-xl'
  return {
    displayValue: (
      <span
        className={`${fontClass} font-semibold leading-none tracking-tight text-white line-clamp-3`}
      >
        {displayValueStr}
      </span>
    )
  }
}

const Reels = () => {
  const { setValue } = useFormContext()
  const clips = useWatch({ name: 'ocf.clips' })
  const fixedReels = useWatch({ name: 'ocf.reels' })

  const [valueAsString, setValueAsString] = useState<string>('')
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null)
  const [defaults, setDefaults] = useState<string[]>([])

  useEffect(() => {
    const reels = getReels(
      { reels: fixedReels ? fixedReels : undefined, clips: clips },
      { grouped: false }
    )
    const reelsGrouped = getReels(
      { reels: fixedReels ? fixedReels : undefined, clips: clips },
      { grouped: true }
    )
    const computedDefaults = getReels({ reels: undefined, clips: clips }, { grouped: false })
    setDefaults(computedDefaults)
    setValueAsString(reels.join(' '))
    const formattedDisplay = formatReelsDisplayValue(reelsGrouped)
    setDisplayValue(formattedDisplay.displayValue)
  }, [clips, fixedReels])

  const update = (newValue: string[]) => {
    setValue('ocf.reels', newValue)
  }

  const clear = () => {
    setValue('ocf.reels', undefined)
  }

  return (
    <ReelsPopupForm value={valueAsString} defaults={defaults} update={update} clear={clear}>
      <Stat label="Reels">{displayValue}</Stat>
    </ReelsPopupForm>
  )
}

export default Reels

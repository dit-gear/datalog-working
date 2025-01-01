import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ReelsPopupForm } from './forms/ReelsPopupForm'
import { getReels } from '@shared/utils/format-reel'
import Stat from '@components/stat'
import { ClipType } from '@shared/datalogTypes'

const Reels = () => {
  const { setValue } = useFormContext()
  const clips: ClipType[] = useWatch({ name: 'clips' }) || []
  const fixedReels = useWatch({ name: 'reels' }) as string[] | undefined

  const [value, setValueState] = useState<string[]>([])
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null)
  const [defaults, setDefaults] = useState<string[]>([])

  useEffect(() => {
    const computedDefaults = getReelsValueFromClips(clips)
    setDefaults(computedDefaults)

    const hasFixedValue = fixedReels && fixedReels.length > 0
    const computedValue = hasFixedValue ? fixedReels : computedDefaults
    setValueState(computedValue)

    const formattedDisplay = formatReelsDisplayValue(hasFixedValue ? fixedReels : clips)
    setDisplayValue(formattedDisplay.displayValue)
  }, [clips, fixedReels])

  const update = (newValue: string[]) => {
    setValue('reels', newValue)
  }

  const clear = () => {
    setValue('reels', undefined)
  }

  // Convert `value` to a string for the `ReelsPopupForm`
  const valueAsString = value.join(' ')

  return (
    <ReelsPopupForm value={valueAsString} defaults={defaults} update={update} clear={clear}>
      <Stat label="Reels">{displayValue}</Stat>
    </ReelsPopupForm>
  )
}

const getReelsValueFromClips = (clips): string[] => {
  return getReels(clips) || []
}

const formatReelsDisplayValue = (reels: string[] | ClipType[]) => {
  if (!reels || reels.length === 0) {
    return { displayValue: null }
  }
  const displayValueStr = getReels(reels, { grouped: true }).join(', ')
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

export default Reels

import useStats from './use-stats'
import { ReelsPopupForm } from './forms/ReelsPopupForm'
import { getReels } from '@renderer/utils/format-reel'
import Stat from '@components/stat'

const getReelsValueFromClips = (clips) => getReels(clips)

const formatReelsDisplayValue = (reels: string[]) => {
  if (!reels || reels.length === 0) {
    return { displayValue: null }
  }
  const displayValue = getReels(reels, { grouped: true }).join(', ')
  const font =
    displayValue.length < 20
      ? 'text-4xl'
      : displayValue.length < 30
        ? 'text-3xl'
        : displayValue.length < 40
          ? 'text-2xl'
          : 'text-xl'
  return {
    displayValue: (
      <span className={`${font} font-semibold leading-none tracking-tight text-white line-clamp-3`}>
        {displayValue}
      </span>
    )
  }
}

const Reels = () => {
  const { value, displayValue, update, defaults, clear } = useStats<string[]>({
    fixedValueName: 'Reels',
    computeValueFromClips: getReelsValueFromClips,
    formatDisplayValue: formatReelsDisplayValue
  })

  // Convert `value` (string[]) to a string for the textarea
  const valueAsString = value.join(' ')

  return (
    <ReelsPopupForm value={valueAsString} defaults={defaults} update={update} clear={clear}>
      <Stat label="Reels">{displayValue}</Stat>
    </ReelsPopupForm>
  )
}

export default Reels

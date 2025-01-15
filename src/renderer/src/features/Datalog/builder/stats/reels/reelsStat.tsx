import Stat from '@components/stat'
import { useState, useEffect } from 'react'

interface ReelsStatProps {
  reels: string[]
}

export const ReelsStat = ({ reels }: ReelsStatProps) => {
  const [display, setDisplay] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<string>()

  useEffect(() => {
    if (reels.length === 0) setDisplay(null)

    const displayValue = reels.toSorted().join(', ')
    const fontClass =
      displayValue.length < 20
        ? 'text-4xl'
        : displayValue.length < 30
          ? 'text-3xl'
          : displayValue.length < 40
            ? 'text-2xl'
            : 'text-xl'

    setDisplay(displayValue)
    setFontSize(fontClass)
  }, [reels])

  return (
    <Stat label="Reels">
      <span
        className={`${fontSize} font-semibold leading-none tracking-tight text-white line-clamp-3`}
      >
        {display}
      </span>
    </Stat>
  )
}

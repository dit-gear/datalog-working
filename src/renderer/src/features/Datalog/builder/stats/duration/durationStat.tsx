import { useEffect, useState } from 'react'
import Stat from '@components/stat'
import { DurationType } from '@shared/shared-types'

interface DurationStatProps {
  value: DurationType | null
}

export const DurationStat = ({ value }: DurationStatProps) => {
  const [display, setDisplay] = useState<DurationType | null>(null)

  useEffect(() => {
    setDisplay(value)
  }, [value])

  return (
    <Stat label="Duration">
      <>
        {display?.hours ? (
          <>
            <span className="text-4xl font-semibold leading-none tracking-tight text-white">
              {display.hours}
            </span>
            <span className="text-sm text-gray-400">h</span>
          </>
        ) : null}
        {display?.minutes ? (
          <>
            <span className="text-4xl font-semibold tracking-tight text-white">
              {display.minutes}
            </span>
            <span className="text-sm text-gray-400">min</span>
          </>
        ) : null}
        {!display?.hours && display?.seconds ? (
          <>
            <span className="text-4xl font-semibold tracking-tight text-white">
              {display.seconds}
            </span>
            <span className="text-sm text-gray-400">sec</span>
          </>
        ) : null}
      </>
    </Stat>
  )
}

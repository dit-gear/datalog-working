// useStats.tsx
import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

interface UseStatsProps<T> {
  fixedValueName: string
  computeValueFromClips: (clips: any[]) => T
  formatDisplayValue: (value: T) => { displayValue: React.ReactNode }
}

const useStats = <T,>({
  fixedValueName,
  computeValueFromClips,
  formatDisplayValue
}: UseStatsProps<T>) => {
  const { setValue } = useFormContext()
  const clips: any[] = useWatch({ name: 'Clips' }) || []
  const fixedValue: T | undefined = useWatch({ name: fixedValueName })

  // Ensure `value` is always defined by providing a default value
  const [value, setValueState] = useState<T>(() => {
    return fixedValue ?? computeValueFromClips(clips)
  })
  const [displayValue, setDisplayValue] = useState<React.ReactNode>()

  useEffect(() => {
    const computedValue: T = fixedValue ?? computeValueFromClips(clips)
    setValueState(computedValue)

    const formattedDisplay = formatDisplayValue(computedValue)
    setDisplayValue(formattedDisplay.displayValue)
  }, [clips, fixedValue])

  const update = (newValue: T) => {
    setValue(fixedValueName, newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }

  const clear = () => {
    setValue(fixedValueName, undefined, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }

  const defaults = computeValueFromClips(clips)

  return {
    value,
    displayValue,
    update,
    defaults,
    clear
  }
}

export default useStats

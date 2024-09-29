import { useEffect, useState } from 'react'
import { FilesType } from '@shared/datalogTypes'
import { FilesPopupForm } from './forms/FilesPopupForm'
import { useFormContext, useWatch } from 'react-hook-form'
import { formatBytes } from '@renderer/utils/format-bytes'
import Stat from '@components/stat'

const Ocf = () => {
  const { setValue } = useFormContext()
  const clips = useWatch({ name: 'Clips' }) || []
  const fixedOcf = useWatch({ name: 'OCF' }) as FilesType | undefined

  const [value, setValueState] = useState<FilesType>({ Files: 0, Size: 0 })
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null)
  const [defaults, setDefaults] = useState<FilesType>({ Files: 0, Size: 0 })

  useEffect(() => {
    const computedDefaults = getOcfValueFromClips(clips)
    setDefaults(computedDefaults)

    const hasFixedValue = fixedOcf && Object.keys(fixedOcf).length > 0
    const computedValue = hasFixedValue ? fixedOcf : computedDefaults
    setValueState(computedValue)

    const formattedDisplay = formatOcfDisplayValue(computedValue)
    setDisplayValue(formattedDisplay.displayValue)
  }, [clips, fixedOcf])

  const update = (newValue: FilesType) => {
    setValue('OCF', newValue)
  }

  const clear = () => {
    setValue('OCF', undefined)
  }

  return (
    <FilesPopupForm
      key="ocf"
      value={value}
      defaults={defaults}
      update={update}
      clear={clear}
      header="OCF"
    >
      <Stat label="OCF">{displayValue}</Stat>
    </FilesPopupForm>
  )
}

const getOcfValueFromClips = (clips): FilesType => {
  const Files = clips.length || 0
  const Size = clips.reduce((acc, clip) => acc + (clip.Size || 0), 0)
  return { Files, Size }
}

const formatOcfDisplayValue = (value: FilesType) => {
  if (!value || value.Files === 0) {
    return { displayValue: null }
  }
  const [sizeValue, sizeUnit] = formatBytes(value.Size, { asTuple: true })
  return {
    displayValue: (
      <>
        <span className="text-4xl font-semibold leading-none tracking-tight text-white line-clamp-3">
          {sizeValue}
        </span>
        <span className="text-sm text-gray-400">{`${sizeUnit} (${value.Files} clips)`}</span>
      </>
    )
  }
}

export default Ocf

import { useEffect, useState } from 'react'
import { FilesType, ClipType } from '@shared/datalogTypes'
import { FilesPopupForm } from './forms/FilesPopupForm'
import { useFormContext, useWatch } from 'react-hook-form'
import { formatBytes } from '@shared/utils/format-bytes'
import Stat from '@components/stat'
import { FileTypeReqType } from './types'

const Ocf = () => {
  const { setValue } = useFormContext()
  const clips = useWatch({ name: 'clips' }) || []
  const fixedOcf = useWatch({ name: 'ocf' }) as FilesType | undefined

  const [value, setValueState] = useState<FilesType>({ files: 0, size: 0 })
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null)
  const [defaults, setDefaults] = useState<FilesType>({ files: 0, size: 0 })

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
    setValue('ocf', newValue)
  }

  const clear = () => {
    setValue('ocf', undefined)
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

const getOcfValueFromClips = (clips: ClipType[]): FilesType => {
  const files = clips.length || 0
  const size = clips.reduce((acc, clip) => acc + (clip.size || 0), 0)
  return { files, size }
}

const formatOcfDisplayValue = (value: FilesType) => {
  if (!value || value.files === 0 || !value.size) {
    return { displayValue: null }
  }
  const [sizeValue, sizeUnit] = formatBytes(value.size, { asTuple: true })
  return {
    displayValue: (
      <>
        <span className="text-4xl font-semibold leading-none tracking-tight text-white line-clamp-3">
          {sizeValue}
        </span>
        <span className="text-sm text-gray-400">{`${sizeUnit} (${value.files} clips)`}</span>
      </>
    )
  }
}

export default Ocf

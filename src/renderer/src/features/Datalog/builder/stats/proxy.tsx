import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FilesType } from '@shared/datalogTypes'
import { FilesPopupForm } from './forms/FilesPopupForm'
import { formatBytes } from '@shared/utils/format-bytes'
import Stat from '@components/stat'

const Proxy = () => {
  const { setValue } = useFormContext()
  const clips = useWatch({ name: 'Clips' }) || []
  const fixedProxy = useWatch({ name: 'Proxy' }) as FilesType | undefined

  const [value, setValueState] = useState<FilesType>({ Files: 0, Size: 0 })
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null)
  const [defaults, setDefaults] = useState<FilesType>({ Files: 0, Size: 0 })

  useEffect(() => {
    const computedDefaults = getProxyValueFromClips(clips)
    setDefaults(computedDefaults)

    const hasFixedValue = fixedProxy && Object.keys(fixedProxy).length > 0
    const computedValue = hasFixedValue ? fixedProxy : computedDefaults
    setValueState(computedValue)

    const formattedDisplay = formatProxyDisplayValue(computedValue)
    setDisplayValue(formattedDisplay.displayValue)
  }, [clips, fixedProxy])

  const update = (newValue: FilesType) => {
    setValue('Proxy', newValue)
  }

  const clear = () => {
    setValue('Proxy', undefined)
  }

  return (
    <FilesPopupForm value={value} defaults={defaults} update={update} clear={clear} header="Proxy">
      <Stat label="Proxy">{displayValue}</Stat>
    </FilesPopupForm>
  )
}

const getProxyValueFromClips = (clips): FilesType => {
  const Files = clips.filter((clip) => clip.Proxy !== undefined).length || 0
  const Size = clips.reduce((acc, clip) => acc + (clip.Proxy?.Size || 0), 0) || 0
  return { Files, Size }
}

const formatProxyDisplayValue = (value: FilesType) => {
  if (!value || value.Files === 0 || !value.Size) {
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

export default Proxy

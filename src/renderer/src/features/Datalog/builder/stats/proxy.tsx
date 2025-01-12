import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FilesPopupForm } from './forms/FilesPopupForm'
import { formatBytes } from '@shared/utils/format-bytes'
import Stat from '@components/stat'

const Proxy = () => {
  const { setValue } = useFormContext()
  /*const clips = useWatch({ name: 'proxy.clips' }) || []
  const fixedProxy = useWatch({ name: 'proxy.files' }) as undefined
  const proxySize = useWatch({ name: 'proxy.size' })*/

  const [value, setValueState] = useState({ files: 0, size: 0 })
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null)
  const [defaults, setDefaults] = useState({ files: 0, size: 0 })

  /*useEffect(() => {
    const computedDefaults = getProxyValueFromClips(clips)
    setDefaults(computedDefaults)

    const hasFixedValue = fixedProxy && Object.keys(fixedProxy).length > 0
    const computedValue = hasFixedValue ? fixedProxy : computedDefaults
    setValueState(computedValue)

    const formattedDisplay = formatProxyDisplayValue(computedValue)
    setDisplayValue(formattedDisplay.displayValue)
  }, [clips, fixedProxy])*/

  const update = (newValue) => {
    setValue('proxy', newValue)
  }

  const clear = () => {
    setValue('proxy', undefined)
  }

  return (
    <FilesPopupForm value={value} defaults={defaults} update={update} clear={clear} header="Proxy">
      <Stat label="Proxy">{displayValue}</Stat>
    </FilesPopupForm>
  )
}

const getProxyValueFromClips = (clips) => {
  const files = clips.filter((clip) => clip.proxy !== undefined).length || 0
  const size = clips.reduce((acc, clip) => acc + (clip.proxy?.size || 0), 0) || 0
  return { files, size }
}

const formatProxyDisplayValue = (value) => {
  if (!value || value.files === 0 || !value.size) {
    return { displayValue: null }
  }
  const [sizeValue, sizeUnit] = formatBytes(value.size, { output: 'tuple' })
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

export default Proxy

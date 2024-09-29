import useStats from './use-stats'
import { FilesType } from '@shared/datalogTypes'
import { FilesPopupForm } from './forms/FilesPopupForm'
import { formatBytes } from '@renderer/utils/format-bytes'
import Stat from '@components/stat'

const getProxyValueFromClips = (clips) => {
  const Files = clips.filter((clip) => clip.Proxy !== undefined).length
  const Size = clips.reduce((acc, clip) => acc + (clip.Proxy?.Size || 0), 0)
  return { Files, Size }
}

const formatProxyDisplayValue = (value: FilesType) => {
  if (!value || value.Files === 0) {
    return { displayValue: null }
  }
  const formattedSize = formatBytes(value.Size, { asTuple: true })
  return {
    displayValue: (
      <>
        <span className="text-4xl font-semibold leading-none tracking-tight text-white line-clamp-3">
          {formattedSize[0]}
        </span>
        <span className="text-sm text-gray-400">{`${formattedSize[1]} (${value.Files} clips)`}</span>
      </>
    )
  }
}

const Proxy = () => {
  const { value, displayValue, update, defaults, clear } = useStats<FilesType>({
    fixedValueName: 'Proxy',
    computeValueFromClips: getProxyValueFromClips,
    formatDisplayValue: formatProxyDisplayValue
  })

  return (
    <FilesPopupForm value={value} defaults={defaults} update={update} clear={clear} header="Proxy">
      <Stat label="Proxy">{displayValue}</Stat>
    </FilesPopupForm>
  )
}

export default Proxy

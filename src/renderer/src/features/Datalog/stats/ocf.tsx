import useStats from './use-stats'
import { FilesType } from '@shared/datalogTypes'
import { FilesPopupForm } from './forms/FilesPopupForm'
import { formatBytes } from '@renderer/utils/format-bytes'
import Stat from '@components/stat'

const getOcfValueFromClips = (clips): FilesType => {
  const Files = clips ? clips.length : 0
  const Size = clips ? clips.reduce((acc, clip) => acc + (clip.Size || 0), 0) : 0
  return { Files, Size }
}

const formatOcfDisplayValue = (value: FilesType) => {
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

const Ocf = () => {
  const { value, displayValue, update, defaults, clear } = useStats<FilesType>({
    fixedValueName: 'OCF',
    computeValueFromClips: getOcfValueFromClips,
    formatDisplayValue: formatOcfDisplayValue
  })

  return (
    <FilesPopupForm value={value} defaults={defaults} update={update} clear={clear} header="OCF">
      <Stat label="OCF">{displayValue}</Stat>
    </FilesPopupForm>
  )
}

export default Ocf

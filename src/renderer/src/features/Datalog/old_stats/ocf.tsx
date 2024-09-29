import { useState, useEffect } from 'react'
import Stat from '@components/stat'
import { useFormContext, useWatch } from 'react-hook-form'
import { ClipType, FilesType } from '@shared/datalogTypes'
import { formatBytes } from '@renderer/utils/format-bytes'
import { FilesPopupForm } from './forms/FilesPopupForm'

type FileStatsType = {
  value: FilesType
  displayValue: number | null
  displaySuffix: string
  clips: number
}

const getSize = (clips: ClipType[]): number =>
  clips.reduce((acc, clip) => acc + (clip.Size || 0), 0)

const Ocf = () => {
  const [stats, setStats] = useState<FileStatsType>({
    value: { Files: 0, Size: 0 }, // Default initial value for stats
    displayValue: 0,
    displaySuffix: '',
    clips: 0
  })
  const { setValue } = useFormContext()
  const clips: ClipType[] = useWatch({ name: 'Clips' })
  const fixedOcf: FilesType = useWatch({ name: 'OCF' })

  useEffect(() => {
    const cliplength = fixedOcf ? fixedOcf.Files : clips.length

    const size = fixedOcf ? fixedOcf.Size : getSize(clips)
    const formattedValueForDisplay = formatBytes(size, { asTuple: true })

    const value = fixedOcf || { Files: clips.length, Size: size }

    setStats({
      value,
      displayValue: formattedValueForDisplay[0],
      displaySuffix: formattedValueForDisplay[1],
      clips: cliplength
    })
  }, [clips, fixedOcf])

  const update = (newValue: FilesType) => {
    setValue('OCF', newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }

  return (
    <FilesPopupForm
      values={stats.value}
      defaults={{ Files: clips.length, Size: getSize(clips) }}
      update={update}
      header="OCF"
    >
      <Stat label="OCF">
        {stats.displayValue && (
          <>
            <span className="text-4xl font-semibold leading-none tracking-tight text-white line-clamp-3">
              {stats.displayValue}
            </span>
            <span className="text-sm text-gray-400">{`${stats.displaySuffix} (${stats.clips}} clips)`}</span>
          </>
        )}
      </Stat>
    </FilesPopupForm>
  )
}
export default Ocf

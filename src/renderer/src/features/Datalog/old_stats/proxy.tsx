import Stat from '@components/stat'
import { useFormContext, useWatch } from 'react-hook-form'
import { ClipType, FilesType } from '@shared/datalogTypes'
import { formatBytes } from '@renderer/utils/format-bytes'
import { FilesPopupForm } from './forms/FilesPopupForm'

const getSize = (clips: ClipType[]): number =>
  clips.reduce((acc, clip) => acc + (clip.Proxy?.Size || 0), 0)

const getProxyClipsCount = (clips: ClipType[]): number =>
  clips.filter((clip: ClipType) => clip.Proxy !== undefined).length

const Proxy = () => {
  const { setValue } = useFormContext()
  const clips: ClipType[] = useWatch({ name: 'Clips' })
  const fixedProxy = useWatch({ name: 'Proxy' })
  const size = fixedProxy.Size ? fixedProxy.Size : getSize(clips)
  const proxyClips = fixedProxy.Files ? fixedProxy.Files : getProxyClipsCount(clips)

  const value = formatBytes(size, { asTuple: true })

  const update = (newValue: FilesType) => {
    /*if (newValue.Files === getProxyClipsCount(clips) && newValue.Size === getSize(clips)) {
      newValue = { Files: 0, Size: 0 }
    }*/
    setValue('Proxy', newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }

  return (
    <FilesPopupForm
      values={{ Files: proxyClips, Size: size }}
      defaults={{ Files: getProxyClipsCount(clips), Size: getSize(clips) }}
      update={update}
      header="Proxys"
    >
      <Stat label="OCF">
        <span className="text-4xl font-semibold leading-none tracking-tight text-white line-clamp-3">
          {value[0]}
        </span>
        <span className="text-sm text-gray-400">{`${value[1]} (${proxyClips} clips)`}</span>
      </Stat>
    </FilesPopupForm>
  )
}
export default Proxy

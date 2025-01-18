import { useMemo } from 'react'
import {
  mergeClips,
  OcfClipTypeExtended,
  SoundClipTypeExtended,
  ProxyClipTypeExtended,
  CustomClipTypeExtended
} from '../table/merge-clips'
import { useFieldArray } from 'react-hook-form'

export const Table = () => {
  const { fields: ocf } = useFieldArray({ name: 'ocf.clips' })
  const { fields: sound } = useFieldArray({ name: 'sound.clips' })
  const { fields: proxy } = useFieldArray({ name: 'proxy.clips' })
  const { fields: custom } = useFieldArray({ name: 'custom' })

  const customTest = [
    {
      clip: 'A001C002_240815_RNK9',
      id: '1234',
      index: 0,
      wb: 'daylight!',
      customkey: 'hello world!'
    }
  ]

  const data = useMemo(() => {
    const clips = {
      ocf: ocf.map((field, index) => ({ ...field, index })) as OcfClipTypeExtended[],
      sound: sound.map((field, index) => ({ ...field, index })) as SoundClipTypeExtended[],
      proxy: proxy.map((field, index) => ({ ...field, index })) as ProxyClipTypeExtended[],
      custom: customTest as CustomClipTypeExtended[]
    }
    return mergeClips(clips)
  }, [ocf, sound, proxy, custom])

  console.log(data)

  return <div></div>
}

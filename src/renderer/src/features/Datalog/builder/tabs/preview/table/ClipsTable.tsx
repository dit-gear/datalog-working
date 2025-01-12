import { useMemo } from 'react'
import { mergeClips } from '@shared/utils/datalog-clips'
import { useWatch } from 'react-hook-form'
import { flattenData } from './flattenData'
import { generateColumns } from './Column'
import DataTable from '../../../../../../components/DataTable'

export const ClipsTable = () => {
  const ocf = useWatch({ name: 'ocf.clips' })
  const sound = useWatch({ name: 'sound.clips' })
  const proxy = useWatch({ name: 'proxy.clips' })
  const custom = useWatch({ name: 'custom' })

  const clips = useMemo(
    () =>
      mergeClips({
        ocf: { clips: ocf },
        sound: { clips: sound },
        proxy: { clips: proxy },
        custom: custom
      }),
    [ocf, sound, proxy, custom]
  )

  console.log(clips)

  const data = useMemo(() => flattenData(clips.map(({ id, ...rest }) => rest)), [clips])
  const columns = useMemo(() => generateColumns(data), [data])

  return (
    <div className="container mx-auto py-4">
      <DataTable columns={columns} data={data} />
      test
    </div>
  )
}

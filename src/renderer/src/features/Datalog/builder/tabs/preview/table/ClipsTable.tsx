import { useMemo } from 'react'
import { mergeClips } from '@shared/utils/datalog-clips'
import { useWatch } from 'react-hook-form'
import { flattenData } from './flattenData'
import { generateColumns } from './Column'
import DataTable from '../../../../../../components/DataTable'

export const ClipsTable = () => {
  const ocf = useWatch({ name: 'ocfClips' })
  const sound = useWatch({ name: 'soundClips' })
  const proxy = useWatch({ name: 'proxyClips' })
  const custom = useWatch({ name: 'customClips' })

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

  const data = useMemo(() => flattenData(clips.map(({ id, ...rest }) => rest)), [clips])
  const columns = useMemo(() => generateColumns(data), [data])

  return (
    <div className="container mx-auto py-4">
      <DataTable columns={columns} data={data} />
    </div>
  )
}

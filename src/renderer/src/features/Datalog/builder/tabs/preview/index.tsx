import { useMemo, memo, useState, useEffect, useRef } from 'react'
import DataTable from './table/DataTable'
import { createTableData } from './table/Data'
import { useWatch } from 'react-hook-form'
import { createColumns } from './table/Column'
import ErrorBoundary from '@renderer/utils/ErrorBoundary'

const Preview = memo(() => {
  const ocfFields = useWatch({ name: 'ocf.clips' }) || []
  const soundFields = useWatch({ name: 'sound.clips' }) || []
  const proxyFields = useWatch({ name: 'proxy.clips' }) || []
  const customFields = useWatch({ name: 'custom' }) || []

  const [data, setData] = useState<any>([])
  const [columns, setColumns] = useState<any>([])
  const previousClips = useRef<string | null>(null)

  const clips = useMemo(
    () => ({
      ocf: ocfFields.map((field: any, index: number) => ({ ...field, index })),
      sound: soundFields.map((field: any, index: number) => ({ ...field, index })),
      proxy: proxyFields.map((field: any, index: number) => ({ ...field, index })),
      custom: customFields.map((field: any, index: number) => ({ ...field, index }))
    }),
    [ocfFields, soundFields, proxyFields, customFields]
  )

  useEffect(() => {
    const serializedClips = JSON.stringify(clips)

    // Skip update if clips haven't changed
    if (serializedClips === previousClips.current) return

    previousClips.current = serializedClips // Update reference to current clips

    // Compute new data and columns
    const newData = createTableData(clips)
    const newColumns = createColumns(newData)

    // Update state only when necessary
    setData(newData)
    setColumns(newColumns)
  }, [clips])

  return (
    <ErrorBoundary>
      <DataTable columns={columns} data={data} />
    </ErrorBoundary>
  )
})
export default Preview

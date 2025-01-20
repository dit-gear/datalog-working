import { useMemo, memo, useState, useEffect, useRef, Suspense, lazy } from 'react'
import DataTable from './table/DataTable'
import { createTableData } from './table/Data'
import { useWatch, useFieldArray } from 'react-hook-form'
import { createColumns } from './table/Column'

const Preview = memo(() => {
  const ocfFields = useWatch({ name: 'ocf.clips' }) || []
  const soundFields = useWatch({ name: 'sound.clips' }) || []
  const proxyFields = useWatch({ name: 'proxy.clips' }) || []
  const customFields = useWatch({ name: 'custom' }) || []
  //const { fields: ocfFields } = useFieldArray({ name: 'ocf.clips' })
  //const { fields: soundFields } = useFieldArray({ name: 'sound.clips' })
  //const { fields: proxyFields } = useFieldArray({ name: 'proxy.clips' })
  //const { fields: customFields } = useFieldArray({ name: 'custom' })

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

  //const data = useMemo(() => createTableData(clips), [clips])
  //const columns = useMemo(() => createColumns(data), [data])

  return <DataTable columns={columns} data={data} />
})
export default Preview

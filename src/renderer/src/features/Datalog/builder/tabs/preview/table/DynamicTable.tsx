import { useEffect, useMemo } from 'react'
import DataTable from '../../../../../../components/DataTable'
import { useFieldArray, useWatch } from 'react-hook-form'
import { flattenData } from './flattenData'
import { generateColumns } from './Column'
import { mergeClips } from '@shared/utils/datalog-clips'

interface DynamicTableProps {
  field: 'ocf.clips' | 'sound.clips' | 'proxy.clips' | 'custom'
}

export const DynamicTable = ({ field }: DynamicTableProps) => {
  const { fields } = useFieldArray({ name: field })

  const data = useMemo(() => flattenData(fields.map(({ id, ...rest }) => rest)), [fields])
  const columns = useMemo(() => generateColumns(data, field), [data])

  console.log('fields', fields)
  console.log('data:', data)
  console.log('columns:', columns)

  return <DataTable columns={columns} data={data} />
}

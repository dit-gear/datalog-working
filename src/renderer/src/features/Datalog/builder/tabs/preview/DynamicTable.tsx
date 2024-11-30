import { useMemo } from 'react'
import DataTable from '../../../../../components/DataTable'
import { useFieldArray } from 'react-hook-form'
import { flattenData } from './flattenData'
import { generateColumns } from './Column'

export const DynamicTable = () => {
  const { fields } = useFieldArray({ name: 'Clips' })
  const data = useMemo(() => flattenData(fields.map(({ id, ...rest }) => rest)), [fields])
  const columns = useMemo(() => generateColumns(data), [data])

  console.log('fields', fields)
  console.log('data:', data)
  console.log('columns:', columns)

  return (
    <div className="container mx-auto py-4">
      <DataTable columns={columns} data={data} />
    </div>
  )
}

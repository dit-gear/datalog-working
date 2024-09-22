import { ColumnDef } from '@tanstack/react-table'
import DataTable from './DataTable'

// Define your data type
type RowData = {
  [key: string]: unknown
}

interface DynamicTableProps {
  data: RowData[] // Accept data as a prop
}

// Sample dynamic data
const data: RowData[] = [
  { name: 'John Doe', age: 30, role: 'Engineer' },
  { name: 'Jane Doe', age: 25, role: 'Designer' },
  { name: 'Alice', age: 28, role: 'Product Manager' }
]

// Generate column definitions dynamically based on the keys of the first object
const generateColumns = (data: RowData[]): ColumnDef<RowData>[] => {
  if (!data.length) return []

  return Object.keys(data[0]).map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize headers
  }))
}

export const DynamicTable = ({ data }: DynamicTableProps) => {
  const columns = generateColumns(data)

  return (
    <div className="container mx-auto py-4">
      <DataTable columns={columns} data={data} />
    </div>
  )
}

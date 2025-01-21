import { ColumnDef } from '@tanstack/react-table'
import { MergedClip } from './Data'

export const createColumns = (data: MergedClip[]): ColumnDef<MergedClip>[] => {
  if (!data.length) return []

  // Generate columns from the flattened data
  const columns = Object.keys(data[0]).map((key) => ({
    id: key,
    key: key,
    accessorKey: key,
    header: key.replace(/_/g, ' ')
  }))
  return columns
}

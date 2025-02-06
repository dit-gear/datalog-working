import { ColumnDef } from '@tanstack/react-table'
import { MergedClip } from './Data'

export const createColumns = (data: MergedClip[]): ColumnDef<MergedClip>[] => {
  if (!data.length) return []

  // Generate columns from the flattened data
  const columns = Object.keys(data[0]).map((key) => {
    let header = key.replace(/_/g, ' ')
    header = header
      .replace(/\bfps\b/g, 'FPS')
      .replace(/\bwb\b/g, 'WB')
      .replace(/\btc\b/g, 'TC')
      .replace(/\blut\b/g, 'LUT')
    return {
      id: key,
      key,
      accessorKey: key,
      header
    }
  })
  return columns
}

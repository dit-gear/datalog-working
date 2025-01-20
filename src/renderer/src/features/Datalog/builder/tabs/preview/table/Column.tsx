import { ColumnDef } from '@tanstack/react-table'
import { formatBytes } from '@shared/utils/format-bytes'
import FormCell from './FormCell'
import { MergedClip, valueTypes } from './Data'

/*const formatHeader = (key: string) => {
  const formattedKey = key.replace(/_/g, ' ')

  // Split by hyphen and return JSX with <br /> for line breaks
  const parts = formattedKey.split('.')

  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="whitespace-nowrap">
          {part}
          {index < parts.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}*/

export const createColumns = (data: MergedClip[]): ColumnDef<MergedClip>[] => {
  console.time('createColumns')
  if (!data.length) return []

  // Generate columns from the flattened data
  const columns = Object.keys(data[0]).map((key) => ({
    id: key,
    key: key,
    accessorKey: key,
    header: key.replace(/_/g, ' '),
    cell: ({ row, column }) => {
      const value: valueTypes = row.getValue(key)
      if (!value) return null

      // Special formatting for Size column
      if ((key === 'size' || key === 'proxy_size') && typeof value.value === 'number') {
        return (
          <span className="whitespace-nowrap">
            {formatBytes(value.value, { output: 'string' })}
          </span>
        )
      }
      /*if (key === 'duration') {
          const v = typeof value === 'number' ? value : 0
          return <DurationCell row={row} column={column} value={v} />
        }*/
      if (Array.isArray(value.value)) {
        return (
          <ul className="list-none pl-4">
            {value.value.map((item, index) => (
              <li key={index}>
                {Array.isArray(item) && item.length > 1 ? (
                  <span className="whitespace-nowrap">[{item.join(', ')}]</span>
                ) : item !== null && item !== undefined ? (
                  item.toString()
                ) : (
                  ''
                )}
              </li>
            ))}
          </ul>
        )
      }
      return <span className="whitespace-nowrap">{value.value}</span>
    }
  }))
  console.timeEnd('createColumns')
  return columns
}

import { ColumnDef } from '@tanstack/react-table'
import DataTable from './DataTable'
import { formatBytes } from '@renderer/utils/format-bytes'
import getVolumeName from '@renderer/features/Datalog/utils/get-volume'
import { formatDurationToString } from '@renderer/utils/format-duration'

// Define your data type
type RowData = {
  [key: string]: unknown
}

interface DynamicTableProps {
  data: RowData[] // Accept data as a prop
}

const formatHeader = (key: string): JSX.Element => {
  // Capitalize the first letter and replace underscores with spaces
  const formattedKey = key.replace(/_/g, ' ')

  // Split by hyphen and return JSX with <br /> for line breaks
  const parts = formattedKey.split('-')

  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className="whitespace-nowrap capitalize">
          {part}
          {index < parts.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}

const isPlainObject = (value: any): value is Record<string, any> => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const flattenObject = (
  obj: Record<string, any>,
  parentKey: string = '',
  res: Record<string, any> = {}
): Record<string, any> => {
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}-${key}` : key

    if (Array.isArray(value)) {
      if (value.length > 0 && isPlainObject(value[0])) {
        value.forEach((item) => {
          Object.entries(item).forEach(([subKey, subValue]) => {
            const arrayKey = `${newKey}-${subKey}`
            if (!res[arrayKey]) res[arrayKey] = []
            res[arrayKey].push(subValue)
          })
        })
      } else res[newKey] = value
    } else if (isPlainObject(value)) {
      // Recursively flatten if the value is a non-array object
      flattenObject(value, newKey, res)
    } else {
      res[newKey] = value
    }
  })

  return res
}

// Flatten the data array while skipping the Copies array
const flattenData = (data: RowData[]): RowData[] => {
  return data.map((item) => {
    const { Copies, ...rest } = item
    const flattened = flattenObject(rest) // Flatten all fields except Copies
    flattened['Copies'] = Copies // Re-add Copies as-is to handle separately
    return flattened
  })
}

const getMaxCopies = (data: RowData[]): number => {
  return data.reduce((max, item) => {
    const copies = (item.Copies as { Path: string; Hash: string | null }[]) || []
    return Math.max(max, copies.length)
  }, 0)
}

// Generate column definitions dynamically based on the keys of the first object
const generateColumns = (data: RowData[]): ColumnDef<RowData>[] => {
  if (!data.length) return []

  const flattenedData = flattenData(data) // Flatten the data first
  const maxCopies = getMaxCopies(data) // Get the max number of copies

  // Generate columns from the flattened data
  const columns: ColumnDef<RowData>[] = Object.keys(flattenedData[0]).flatMap((key) => {
    if (key === 'Copies') {
      // For the Copies field, generate dynamic columns for each copy's Path
      const pathColumns: ColumnDef<RowData>[] = Array.from({ length: maxCopies }, (_, i) => ({
        accessorKey: `Copy ${i + 1}`, // Column key like "Copy 1", "Copy 2"
        header: `Copy ${i + 1}`, // Header name
        cell: ({ row }) => {
          const copies = row.original.Copies as { Path: string; Hash: string | null }[]
          if (copies && copies[i]) {
            return getVolumeName(copies[i].Path) || 'No Path'
          }
          return 'No Copy' // In case there are fewer copies than the max number
        }
      }))

      // Generate a single Hashes column
      const hashColumn: ColumnDef<RowData> = {
        accessorKey: `Hash`,
        header: `Hash`,
        cell: ({ row }) => {
          const copies = row.original.Copies as { Path: string; Hash: string | null }[]
          const hashes = copies.map((copy) => copy.Hash || 'No Hash')
          const allSame = hashes.every((hash) => hash === hashes[0])
          return allSame ? hashes[0] : <span className="text-yellow-300">{hashes.join(', ')}</span>
        }
      }

      return [...pathColumns, hashColumn] // Return both path columns and the single hash column
    }

    // Regular columns like Size, Clip, Proxy, etc., using the flattened key
    return {
      accessorKey: key,
      header: () => formatHeader(key),
      cell: ({ row }) => {
        const value: number | string = row.getValue(key)
        // Special formatting for Size column
        if (key.includes('Size') && typeof value === 'number') {
          return <span className="whitespace-nowrap">{formatBytes(value)}</span>
        }
        if (key === 'Duration' && typeof value === 'number') {
          return <span className="whitespace-nowrap">{formatDurationToString(value)}</span>
        }
        if (Array.isArray(value)) {
          return (
            <ul className="list-none pl-4">
              {value.map((item, index) => (
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

        // Handle other types
        return value !== null && value !== undefined ? (
          <span className={value.toString().length < 40 ? 'whitespace-nowrap' : ''}>
            {value.toString()}
          </span>
        ) : (
          ''
        )
      }
    }
  })

  return columns
}

export const DynamicTable = ({ data }: DynamicTableProps) => {
  const flattenedData = flattenData(data)
  const columns = generateColumns(flattenedData)

  return (
    <div className="container mx-auto py-4">
      <DataTable columns={columns} data={flattenedData} />
    </div>
  )
}

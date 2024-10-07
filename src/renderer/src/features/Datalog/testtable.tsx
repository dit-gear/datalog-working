import React, { useState, useMemo } from 'react'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  ExpandedState
} from '@tanstack/react-table'

// Define the data structure
interface ParentData {
  id: number
  name: string
  age: number
  address: string
}

interface ChildData {
  orderId: number
  product: string
  quantity: number
}

// Sample parent data
const parentData: ParentData[] = [
  { id: 1, name: 'John Doe', age: 28, address: '123 Main St' },
  { id: 2, name: 'Jane Smith', age: 32, address: '456 Oak Ave' }
]

// Sample child data mapped by parent id
const childDataMap: Record<number, ChildData[]> = {
  1: [
    { orderId: 101, product: 'Laptop', quantity: 1 },
    { orderId: 102, product: 'Phone', quantity: 2 }
  ],
  2: [
    { orderId: 201, product: 'Tablet', quantity: 3 },
    { orderId: 202, product: 'Headphones', quantity: 5 }
  ]
}

// Create a column helper for type safety
const columnHelper = createColumnHelper<ParentData>()

// Define parent table columns
const parentColumns: ColumnDef<ParentData>[] = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('address', {
    header: 'Address',
    cell: (info) => info.getValue()
  }),
  // Expander column with button
  columnHelper.display({
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      // Ensure row is expandable only if it has child data
      const canExpand = row.getCanExpand()

      // Debug output to ensure getCanExpand works
      console.log('Row expandability:', row.id, canExpand)

      return canExpand ? (
        <button onClick={row.getToggleExpandedHandler()}>
          {row.getIsExpanded() ? '🔽 Collapse' : '▶️ Expand'}
        </button>
      ) : null
    }
  })
]

// Define child table columns
const childColumns: ColumnDef<ChildData>[] = [
  {
    header: 'Order ID',
    accessorKey: 'orderId'
  },
  {
    header: 'Product',
    accessorKey: 'product'
  },
  {
    header: 'Quantity',
    accessorKey: 'quantity'
  }
]

// SubComponent to render the nested table for each expanded row
const SubComponent = ({ row }: { row: any }) => {
  const data = useMemo(() => childDataMap[row.original.id] || [], [row])
  const table = useReactTable({
    data,
    columns: childColumns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const NestedTableExample = () => {
  const [expanded, setExpanded] = useState<ExpandedState>({}) // Use ExpandedState type

  const columns = useMemo(() => parentColumns, [])
  const data = useMemo(() => parentData, [])

  const table = useReactTable({
    data,
    columns,
    state: { expanded },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true, // Ensure expansion is enabled
    onExpandedChange: (updater) => setExpanded(updater),
    getRowCanExpand: (row) => !!childDataMap[row.original.id] // Rows can expand if they have child data
  })

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={row.getVisibleCells().length}>
                    <SubComponent row={row} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default NestedTableExample

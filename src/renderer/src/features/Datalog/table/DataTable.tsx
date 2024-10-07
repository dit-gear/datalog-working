import React, { useState } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[] // Columns array from @tanstack/react-table
  data: TData[] // Data array matching the structure passed to the table
}

const DataTable = <TData extends object>({
  columns,
  data
}: DataTableProps<TData>): React.ReactElement => {
  const [lastSelectedRowIndex, setLastSelectedRowIndex] = useState<number | null>(null) // Track the last clicked row for Shift + Click functionality
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection
    },
    onRowSelectionChange: setRowSelection
  })

  const toggleRowSelection = (rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault() // Prevent text selection when using Shift or Ctrl/Cmd clicks

    const rowId = table.getRowModel().rows[rowIndex].id
    let currentSelection = { ...rowSelection }

    if (event.shiftKey) {
      if (lastSelectedRowIndex !== null) {
        // Handle Shift + Click: select or deselect range of rows between last selected and clicked row
        const start = Math.min(lastSelectedRowIndex, rowIndex)
        const end = Math.max(lastSelectedRowIndex, rowIndex)

        // Determine whether to select or deselect based on the selection state of the clicked row
        const isRowSelected = !!rowSelection[rowId]

        for (let i = start; i <= end; i++) {
          const rowIdToToggle = table.getRowModel().rows[i].id
          if (isRowSelected) {
            // Deselect the range
            delete currentSelection[rowIdToToggle]
          } else {
            // Select the range
            currentSelection[rowIdToToggle] = true
          }
        }

        // Update lastSelectedRowIndex
        if (!isRowSelected) {
          setLastSelectedRowIndex(rowIndex)
        } else {
          // Check if any rows are still selected
          if (Object.keys(currentSelection).length === 0) {
            setLastSelectedRowIndex(null)
          }
        }
      } else {
        // No lastSelectedRowIndex, select the clicked row
        currentSelection[rowId] = true
        setLastSelectedRowIndex(rowIndex)
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Handle Ctrl/Cmd + Click: toggle the individual row
      if (currentSelection[rowId]) {
        delete currentSelection[rowId] // Deselect the row

        // Reset lastSelectedRowIndex if no rows are selected
        if (Object.keys(currentSelection).length === 0) {
          setLastSelectedRowIndex(null)
        }
      } else {
        currentSelection[rowId] = true // Select the row
        setLastSelectedRowIndex(rowIndex)
      }
    } else {
      // Simple Click without modifiers - do nothing
      return
    }

    setRowSelection(currentSelection)
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, rowIndex) => {
            const isSelected = !!rowSelection[row.id]
            return (
              <TableRow
                key={row.id}
                data-state={isSelected && 'selected'}
                onClick={(event) => toggleRowSelection(rowIndex, event)}
                className="select-none"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default DataTable

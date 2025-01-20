import { memo, useState, useEffect } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { EditingCellType, TempValue } from './types'
import FormCell from './FormCell'
import { useFormContext } from 'react-hook-form'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[] // Columns array from @tanstack/react-table
  data: TData[] // Data array matching the structure passed to the table
}

const DataTable = memo(<TData extends object>({ columns, data }: DataTableProps<TData>) => {
  const { setValue } = useFormContext()
  const [editingCell, setEditingCell] = useState<EditingCellType>(null)
  const [temporaryValue, setTemporaryValue] = useState<TempValue>(null)

  const handleSave = (
    path: string,
    tempV: TempValue,
    value: string,
    originalValue: string,
    nextCell: EditingCellType
  ) => {
    if (value !== originalValue) {
      setTemporaryValue(tempV)
      setEditingCell(nextCell)
      setValue(path, value)
    } else {
      setEditingCell(nextCell)
    }
  }

  useEffect(() => {
    if (temporaryValue !== null) {
      const timer = setTimeout(() => {
        setTemporaryValue(null)
      }, 0) // Runs immediately after render cycle

      return () => clearTimeout(timer) // Clean up if needed
    }
  }, [temporaryValue])

  // Augment columns so we can intercept `cell` rendering
  const editableColumns = columns.map((col) => ({
    ...col,
    cell: (props: any) => {
      const { row, column } = props
      const rowIndex = row.index
      const colId = column.id
      const value = row.getValue(colId)

      if (!value) {
        return null
      }
      const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colId === colId

      // If cell is not marked editable, just render its value
      if (!value.edit) {
        return <span className="whitespace-nowrap">{value.value}</span>
      }

      // If currently editing this cell, show <FormCell>
      if (isEditing) {
        return (
          <FormCell
            rowIndex={rowIndex}
            column={column}
            value={value}
            totalRows={data.length}
            handleSave={(v, n) =>
              handleSave(
                `${value.path}.${column.id}`,
                { rowIndex, colId, value: v },
                v,
                value.value,
                n
              )
            }
            // When leaving the input (onBlur), we exit editing mode
            //onBlur={(next) => setEditingCell(next)}
          />
        )
      }

      // Otherwise, read-only text — double-click to edit
      return (
        <span
          className="whitespace-nowrap -ml-2 py-3 pl-3 pr-12 cursor-text"
          onClick={() => setEditingCell({ rowIndex, colId })}
        >
          {temporaryValue?.rowIndex === rowIndex && temporaryValue?.colId === colId
            ? temporaryValue?.value
            : value.value}
        </span>
      )
    }
  }))

  const table = useReactTable({
    data,
    columns: editableColumns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="overflow-auto">
      <Table className="relative">
        <TableHeader className="sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="capitalize">
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
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="h-[70px]">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
})

export default DataTable

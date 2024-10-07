import { ColumnDef } from '@tanstack/react-table'
import { LogSum } from './types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { Checkbox } from '@components/ui/checkbox'
import { MoreHorizontal, Trash2, Pencil, FileDown } from 'lucide-react'
import { Button } from '@components/ui/button'

export const Columns: ColumnDef<LogSum>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'Folder',
    header: 'Index'
  },
  {
    accessorKey: 'Day',
    header: 'Day'
  },
  {
    accessorKey: 'Date',
    header: 'Date'
  },
  {
    accessorKey: 'unit',
    header: 'Unit'
  },
  {
    accessorKey: 'OCFSize',
    header: 'OCF Size'
  },
  {
    accessorKey: 'ProxySize',
    header: 'Proxy Size'
  },
  {
    accessorKey: 'Duration',
    header: 'Duration'
  },
  {
    accessorKey: 'Reels',
    header: 'Reels'
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileDown className="mr-2 h-4 w-4" />
              <span>QC Report</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileDown className="mr-2 h-4 w-4" />
              <span>Datalog</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-800 hover:text-red-900">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

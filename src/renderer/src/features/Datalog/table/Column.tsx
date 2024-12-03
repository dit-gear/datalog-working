import { ColumnDef } from '@tanstack/react-table'
import { LogSum } from './types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup
} from '@components/ui/dropdown-menu'
import { Checkbox } from '@components/ui/checkbox'
import { MoreHorizontal, Trash2, Pencil, FileDown } from 'lucide-react'
import { Button } from '@components/ui/button'
import { DatalogType } from '@shared/datalogTypes'
import { DropdownMenuPortal, DropdownMenuSubTrigger } from '@radix-ui/react-dropdown-menu'

export const Columns = (handlers: {
  handleDelete: (datalog: DatalogType) => void
  handleEdit: (datalog: DatalogType) => void
}): ColumnDef<LogSum>[] => [
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
      const datalog = row.original.raw
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlers.handleEdit(datalog)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            {/*<DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" />
                <span>Export</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Send</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <span>Test</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>*/}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-800 hover:text-red-900"
              onClick={() => handlers.handleDelete(datalog)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

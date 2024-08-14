import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@components/ui/table'
import { Button } from '@components/ui/button'
import { ArrowUpRightFromSquare, MoreHorizontal, Trash2, Pencil, FileDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { entryType } from '@types'
import formatDuration from '@renderer/utils/formatDuration'
import { getVolumes, getReels } from '../utils'

interface DatalogtableProps {
  log?: entryType[]
}

const Datalogtable = ({ log }: DatalogtableProps): JSX.Element | null => {
  if (!log) return null

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead>DAY</TableHead>
          <TableHead>DATE</TableHead>
          <TableHead>OCF FILES</TableHead>
          <TableHead>OCF SIZE</TableHead>
          <TableHead>PROXY SIZE</TableHead>
          <TableHead>DURATION</TableHead>
          <TableHead>VOLUMES</TableHead>
          <TableHead className="text-right">REELS</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {log && log.length > 0 ? (
          log.map((log, index) => (
            <TableRow key={index}>
              <TableCell>
                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 p-0">
                  <ArrowUpRightFromSquare className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="font-medium">{log.Day}</TableCell>
              <TableCell>{log.Date}</TableCell>
              <TableCell>{log.Files ? log.Files : null}</TableCell>
              <TableCell>{log.Size ? log.Size : null}</TableCell>
              <TableCell>{log.ProxySize ? log.ProxySize : null}</TableCell>
              <TableCell>
                {log.Duration
                  ? ((): string => {
                      const { hours, minutes } = formatDuration(log.Duration)
                      return `${hours ? `${hours}h ` : ''}${minutes}min`
                    })()
                  : null}
              </TableCell>
              <TableCell>{log.Clips.length > 0 ? getVolumes(log.Clips) : null}</TableCell>
              <TableCell className="text-right">
                {log.Clips.length > 0 ? getReels(log.Clips).join(', ') : null}
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))
        ) : (
          <div className="flex flex-col">No entries</div>
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>WEEK 1 Total</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell>XX</TableCell>
          <TableCell>XX</TableCell>
          <TableCell>XX</TableCell>
          <TableCell>XX</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default Datalogtable

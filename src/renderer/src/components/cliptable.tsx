import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import { Badge } from '@components/ui/badge'
import { combinedType } from '@shared/shared-types'
import { splitStringIntoArray } from '@renderer/utils'

interface CliptableProps {
  clips: combinedType[]
}

const Cliptable = ({ clips }: CliptableProps): JSX.Element | null => {
  if (clips.length === 0) {
    return null
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Clip</TableHead>
          <TableHead>Volumes</TableHead>
          <TableHead>Scene</TableHead>
          <TableHead>Shot</TableHead>
          <TableHead>Take</TableHead>
          <TableHead>Proxy</TableHead>
          <TableHead>QC</TableHead>
          <TableHead className="text-right">QC Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clips.map((row: combinedType, index: number) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{row.Clip}</TableCell>
            <TableCell>
              {row.Volumes.map((volume, index) => (
                <div key={index} className={`flex gap-2 ${volume.length > 1 ? 'mt-2' : null}`}>
                  <p>{`Copy ${index + 1}:`}</p>
                  {volume.map((item, idx) => (
                    <Badge key={idx}>{item}</Badge>
                  ))}
                </div>
              ))}
            </TableCell>
            <TableCell>{row.Scene ? row.Scene : null}</TableCell>
            <TableCell>{row.Shot ? row.Shot : null}</TableCell>
            <TableCell>{row.Take ? row.Take : null}</TableCell>
            <TableCell>{row.Proxy ? '✅' : '❌'}</TableCell>
            <TableCell>{row.QC ? '✅' : '❌'}</TableCell>
            <TableCell className="text-right">
              {row.QC && !row.QC.includes('000')
                ? splitStringIntoArray(row.QC).map((note, index) => <div key={index}>{note}</div>)
                : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default Cliptable

import DataTable from './DataTable'
import { getOCFSize, getProxySize, getDuration, getReels } from '@shared/utils/datalog-methods'
import { DatalogType } from '@shared/datalogTypes'
import { LogSum } from './types'
import { Columns } from './Column'

interface tableprops {
  logs: DatalogType[]
}

const Table = ({ logs }: tableprops) => {
  const DatalogRows = (logs: DatalogType[]): LogSum[] => {
    return logs.map((data) => ({
      Folder: data.Folder,
      Day: data.Day,
      Date: data.Date,
      Unit: data.Unit,
      OCFSize: getOCFSize(data),
      ProxySize: getProxySize(data),
      Duration: getDuration(data, { separator: ' ', asString: true }),
      Reels: getReels(data, { grouped: true })
    }))
  }

  return <DataTable columns={Columns} data={DatalogRows(logs)} />
}

export default Table

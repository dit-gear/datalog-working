import DataTable from './DataTable'
import { getOCFSize, getProxySize, getDuration, getReels } from '@shared/utils/datalog-methods'
import { DatalogType } from '@shared/datalogTypes'
import { LogSum } from './types'
import { Columns } from './Column'

interface tableprops {
  logs: DatalogType[]
  refetch: () => void
}

const Table = ({ logs, refetch }: tableprops) => {
  const handleDelete = async (datalog: DatalogType) => {
    try {
      const res = await window.api.deleteDatalog(datalog)
      if (res.success) {
        refetch()
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const DatalogRows = (logs: DatalogType[]): LogSum[] => {
    return logs.map((data) => ({
      Folder: data.Folder,
      Day: data.Day,
      Date: data.Date,
      Unit: data.Unit,
      OCFSize: getOCFSize(data),
      ProxySize: getProxySize(data),
      Duration: getDuration(data, { separator: ' ', asString: true }),
      Reels: getReels(data, { grouped: true }),
      raw: data
    }))
  }

  return <DataTable columns={Columns(handleDelete)} data={DatalogRows(logs)} />
}

export default Table

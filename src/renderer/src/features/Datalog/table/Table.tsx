import React, { useMemo } from 'react'
import DataTable from './DataTable'
import { getOCFSize, getProxySize, getDuration, getReels } from '@shared/utils/datalog-methods'
import { DatalogType } from '@shared/datalogTypes'
import { LogSum } from './types'
import { Columns } from './Column'

interface TableProps {
  logs: DatalogType[]
  refetch: () => void
  handleEdit: (datalog: DatalogType) => void
}

const Table: React.FC<TableProps> = React.memo(({ logs, refetch, handleEdit }) => {
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

  const handlers = useMemo(() => ({ handleDelete, handleEdit }), [handleDelete, handleEdit])

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

  const columns = useMemo(() => Columns(handlers), [handlers])

  return <DataTable columns={columns} data={DatalogRows(logs)} />
})

export default Table

import React, { useMemo } from 'react'
import DataTable from './DataTable'
import { DatalogType } from '@shared/datalogTypes'
import { LogSum } from './types'
import { Columns } from './Column'
import { Datalog } from '@shared/datalogClass'
import { useNavigate } from 'react-router-dom'

interface TableProps {
  logs: DatalogType[]
}

export class PublicDatalog extends Datalog {
  public accessRaw: DatalogType // Override raw as public

  constructor(data: DatalogType) {
    super(data)
    this.accessRaw = data // Reassign explicitly because it's private in the base class
  }
}

const Table: React.FC<TableProps> = React.memo(({ logs }) => {
  const navigate = useNavigate()
  const classLogs = React.useMemo(() => logs.map((log) => new PublicDatalog(log)), [logs])

  const handleDelete = async (datalog: DatalogType) => {
    try {
      await window.mainApi.deleteDatalog(datalog)
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (datalog: DatalogType) => navigate(`/builder/${datalog.id}`)

  const handlers = useMemo(() => ({ handleDelete, handleEdit }), [handleDelete, handleEdit])

  const DatalogRows = (logs: PublicDatalog[]): LogSum[] => {
    return logs.map((data) => ({
      id: data.id,
      day: data.day,
      date: data.date,
      unit: data.unit,
      ocfSize: data.ocf.size(),
      proxySize: data.proxy.size(),
      duration: data.ocf.duration(),
      reels: data.ocf.reels({ rangeMerging: true }),
      raw: data.accessRaw
    }))
  }

  const columns = useMemo(() => Columns(handlers), [handlers])

  return <DataTable columns={columns} data={DatalogRows(classLogs)} />
})

export default Table

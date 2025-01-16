import React, { useMemo } from 'react'
import DataTable from './DataTable'
import { DatalogType } from '@shared/datalogTypes'
import { LogSum } from './types'
import { Columns } from './Column'
import { Datalog } from '@shared/datalogClass'

interface TableProps {
  logs: DatalogType[]
  handleEdit: (datalog: DatalogType) => void
}

const Table: React.FC<TableProps> = React.memo(({ logs, handleEdit }) => {
  const classLogs = React.useMemo(() => logs.map((log) => new Datalog(log)), [logs])

  const handleDelete = async (datalog: DatalogType) => {
    try {
      await window.mainApi.deleteDatalog(datalog)
    } catch (error) {
      console.error(error)
    }
  }

  const handlers = useMemo(() => ({ handleDelete, handleEdit }), [handleDelete, handleEdit])

  const DatalogRows = (logs: Datalog[]): any[] => {
    return logs.map((data) => ({
      id: data.id,
      day: data.day,
      date: data.date,
      unit: data.unit,
      ocfSize: data.ocf.size(),
      proxySize: data.proxy.size(),
      duration: data.ocf.durationReadable(),
      reels: data.ocf.reels({ grouped: true }),
      raw: data
    }))
  }

  const columns = useMemo(() => Columns(handlers), [handlers])

  return <DataTable columns={columns} data={DatalogRows(classLogs)} />
})

export default Table

/*
const DatalogRows = (logs: DatalogType[]): LogSum[] => {
    return logs.map((data) => ({
      id: data.id,
      day: data.day,
      date: data.date,
      unit: data.unit,
      ocfSize: getOCFSize(data),
      proxySize: getProxySize(data),
      duration: getDuration(data, { separator: ' ', asString: true }),
      reels: getReels(data, { grouped: true }),
      raw: data
    }))
  } */

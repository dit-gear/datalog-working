import { DatalogType } from '@shared/datalogTypes'
import { ProjectRootType } from '@shared/projectTypes'

export function getLatestLog(logs: DatalogType[], project: ProjectRootType): DatalogType {
  if (!logs.length) throw new Error('no logs')

  const maxDay = Math.max(...logs.map((log) => log.day))

  const latestEntries = logs.filter((log) => log.day === maxDay)

  if (project.unit && latestEntries.length > 1) {
    const matchingUnitEntries = latestEntries.filter((log) => log.unit === project.unit)
    if (matchingUnitEntries.length === 1) return matchingUnitEntries[0]
  }
  return latestEntries[0]
}

export async function getLatestTwoDatalogs(datalogs: DatalogType[]): Promise<DatalogType[]> {
  if (!datalogs.length) return []

  const maxDay = Math.max(...datalogs.map((log) => log.day))
  const latestLog = datalogs.find((log) => log.day === maxDay)!

  const previousLogs = datalogs.filter((log) => log.day < maxDay)
  if (!previousLogs.length) return [latestLog]

  const secondMaxDay = Math.max(...previousLogs.map((log) => log.day))
  const secondLog = datalogs.find((log) => log.day === secondMaxDay)!

  return [latestLog, secondLog]
}

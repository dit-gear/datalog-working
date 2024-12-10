import { DatalogType } from '@shared/datalogTypes'
import { ProjectRootType } from '@shared/projectTypes'

export function getLatestDatalog(
  datalogs: DatalogType[],
  project: ProjectRootType
): DatalogType | DatalogType[] {
  if (!datalogs.length) return []

  const maxDay = Math.max(...datalogs.map((log) => log.Day))

  const latestEntries = datalogs.filter((log) => log.Day === maxDay)

  if (latestEntries.length === 1) return latestEntries[0]

  if (project.unit && latestEntries.length > 1) {
    const matchingUnitEntries = latestEntries.filter((log) => log.Unit === project.unit)
    if (matchingUnitEntries.length === 1) return matchingUnitEntries[0]
  }
  return latestEntries
}

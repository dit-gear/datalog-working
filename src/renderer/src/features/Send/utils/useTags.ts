import { useDataContext } from '../dataContext'

export const useTags = () => {
  const { projectName, data } = useDataContext()

  if (!data) return null

  const log = Array.isArray(data.selection) ? data.selection[0] : data.selection

  const tags = {
    day: log.day,
    date: log.date,
    projectName: projectName,
    unit: log.unit,
    log: log.id
  }
  return tags
}

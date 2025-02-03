import { useDataContext } from '../dataContext'
import { getFileName } from '@shared/utils/formatDynamicString'

export const useTags = () => {
  const { projectName, data } = useDataContext()

  if (!data || Array.isArray(data.selection)) return null

  const log = data.selection

  const tags = {
    day: log.day,
    date: log.date,
    projectName: projectName,
    unit: log.unit,
    log: log.id
  }
  return tags
}

export const useFileName = (outputName: string, fallbackName: string): string => {
  const { data, projectName } = useDataContext()
  const fileName = getFileName({
    selection: data?.selection,
    outputName,
    fallbackName,
    projectName
  })
  return fileName
}

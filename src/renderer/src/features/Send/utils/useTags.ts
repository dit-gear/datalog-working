import { replaceTagsMultiple } from '@shared/utils/formatDynamicString'
import { InitialSendData } from '@shared/shared-types'

export const useTags = (data: InitialSendData) => {
  if (!data?.selection || Array.isArray(data.selection)) return null

  const log = data.selection

  const tags = {
    day: log.day,
    date: log.date,
    projectName: data.project.project_name,
    unit: log.unit,
    log: log.id
  }
  return tags
}

export const useStringWithTags = (
  data: InitialSendData,
  outputName: string,
  fallbackName: string
): string => {
  const fileName = replaceTagsMultiple({
    selection: data?.selection,
    template: outputName,
    fallbackName,
    projectName: data?.project.project_name!
  })
  return fileName
}

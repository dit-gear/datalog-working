import { replaceTagsMultiple } from '@shared/utils/formatDynamicString'
import { InitialSendData } from '@shared/shared-types'

export const useTags = (data: InitialSendData) => {
  if (!data?.selection || Array.isArray(data.selection)) return null

  const log = data.logs.filter((log) => data.selection?.includes(log.id))[0]

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
  const { selection, logs, project } = data
  const fileName = replaceTagsMultiple({
    selection,
    logs,
    template: outputName,
    fallbackName,
    project
  })
  return fileName
}

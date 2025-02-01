import replaceTags, { Tags } from '@renderer/utils/formatDynamicString'

export const getDefaultId = (template: string, tags: Tags): string => {
  return replaceTags(template, tags)
}

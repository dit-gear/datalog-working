import replaceTags, { Tags } from '@shared/utils/formatDynamicString'

export const getDefaultId = (template: string, tags: Tags): string => {
  return replaceTags(template, tags)
}

import { TemplateDirectoryFile } from '@shared/projectTypes'

export const getReactTemplate = (
  name: string,
  directories: TemplateDirectoryFile[],
  type: 'email' | 'pdf'
): TemplateDirectoryFile | undefined => {
  // Filter directories that match the desired name and type
  const filteredDirectories = directories.filter((dir) => dir.name === name && dir.type === type)

  if (filteredDirectories.length === 0) {
    return undefined
  }

  // Prioritize by scope ('project' > 'global')
  return filteredDirectories.find((dir) => dir.scope === 'project') ?? filteredDirectories[0]
}

export const fetchFileContent = async (path: string): Promise<string> => {
  try {
    const content = await window.sendApi.getFileContent(path)
    return content
  } catch (err: any) {
    throw new Error(`Failed to fetch file content: ${err.message}`)
  }
}

export const fetchMultipleFileContent = async (
  paths: string[]
): Promise<Record<string, string>> => {
  try {
    const content = await window.sendApi.getMultipleFileContent(paths)
    return content
  } catch (err: any) {
    throw new Error(`Failed to fetch file content: ${err.message}`)
  }
}

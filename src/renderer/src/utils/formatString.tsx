export function getFileExtension(filename: string): string | null {
  const lastDotIndex = filename.lastIndexOf('.')

  if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
    return filename.substring(lastDotIndex + 1).toLowerCase()
  } else {
    return null
  }
}

export const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || filePath
}

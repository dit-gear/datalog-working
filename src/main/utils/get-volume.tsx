function getVolumeName(filePath: string): string | null {
  if (typeof filePath !== 'string') {
    return null
  }

  // Check if the file path starts with '/Volumes/' (external or mounted volumes)
  if (filePath.startsWith('/Volumes/')) {
    const parts = filePath.split('/')
    return parts.length > 2 ? parts[2] : null
  } else {
    // Check if the path is from the local system volume
    // Split the path and look for system root indications
    const parts = filePath.split('/')
    // Usually, the local system starts directly under the root '/', e.g., '/Users/name'
    if (parts.length > 1) {
      switch (parts[1]) {
        case 'Users':
        case 'Applications':
        case 'System':
        case 'Library':
          // This is the main system volume, which is generally named 'Macintosh HD' unless renamed
          return 'Macintosh HD'
        default:
          // You might want to add more cases as needed or handle it differently
          return null
      }
    }
  }

  return null // default return if none of the conditions are met
}
export default getVolumeName

export function formatBytes(bytes, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// formatBytes(1024));       - Output: 1 KB
// formatBytes(1234));       - Output: 1.21 KB
// formatBytes(123456789));  - Output: 117.74 MB

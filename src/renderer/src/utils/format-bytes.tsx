type FormatBytesOptions = {
  asTuple?: boolean
}
export function formatBytes(bytes: number, options?: { asTuple: true }): [number, string]
export function formatBytes(bytes: number, options?: { asTuple?: false }): string
export function formatBytes(
  bytes: number,
  options: FormatBytesOptions = {}
): string | [number, string] {
  const { asTuple = false } = options

  if (bytes === 0) return asTuple ? [0, 'B'] : '0 B'

  const k = 1000
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)

  const integerPartLength = Math.floor(value).toString().length
  const decimals = Math.max(0, 3 - integerPartLength) // 1 digit = 2 decimals, 2 digits = 1, 3 or more = 0

  const formattedValue = parseFloat(value.toFixed(decimals))

  return asTuple ? [formattedValue, sizes[i]] : `${formattedValue} ${sizes[i]}`
}

// formatBytes(1000);       - Output: 1 KB
// formatBytes(1210);       - Output: 1.21 KB
// formatBytes(123456789);  - Output: 117 MB
// formatBytes(1024, {isTuple: true}); // Output: [1, 'KB']

export type FormatBytesTypes = 'auto' | 'tb' | 'gb' | 'mb' | 'bytes'

export type FormatOutput = 'tuple' | 'number' | 'string'

export type FormatBytesOptions<T extends FormatOutput = 'string'> = {
  output: T
  type?: FormatBytesTypes
}

export function formatBytes<T extends FormatOutput>(
  bytes: number | undefined,
  options: FormatBytesOptions<T>
): T extends 'tuple' ? [number, string] : T extends 'number' ? number : string {
  const { output = 'string', type = 'auto' } = options

  if (!bytes || bytes === 0) {
    if (output === 'tuple') return [0, 'B'] as any
    if (output === 'number') return 0 as any
    return '' as any
  }

  const k = 1000
  let value: number
  let unit: string

  if (type === 'auto') {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    value = bytes / Math.pow(k, i)
    unit = sizes[i]
  } else {
    const unitMapping: Record<'bytes' | 'mb' | 'gb' | 'tb', { exponent: number; label: string }> = {
      bytes: { exponent: 0, label: 'B' },
      mb: { exponent: 2, label: 'MB' },
      gb: { exponent: 3, label: 'GB' },
      tb: { exponent: 4, label: 'TB' }
    }
    const mapping = unitMapping[type]
    value = bytes / Math.pow(k, mapping.exponent)
    unit = mapping.label
  }

  const integerPartLength = Math.floor(value).toString().length
  const decimals = Math.max(0, 3 - integerPartLength) // 1 digit = 2 decimals, 2 digits = 1, 3 or more = 0

  const formattedValue = parseFloat(value.toFixed(decimals))

  if (output === 'tuple') return [formattedValue, unit] as any
  if (output === 'number') return formattedValue as any
  return `${formattedValue} ${unit}` as any
}

// formatBytes(1000);       - Output: 1 KB
// formatBytes(1210);       - Output: 1.21 KB
// formatBytes(123456789);  - Output: 117 MB
// formatBytes(1024, {isTuple: true}); // Output: [1, 'KB']

/**
 * Utility function that converts TB, GB or MB to byte
 */
export function convertToBytes(num: number, unit: 'tb' | 'gb' | 'mb'): number {
  const conversions = {
    tb: 1000 ** 4,
    gb: 1000 ** 3,
    mb: 1000 ** 2
  }
  return num * conversions[unit]
}

export const removeEmptyFields = (
  data: Record<string, any>,
  keysToRemove: string[] = []
): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      if (value === undefined) return false
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim() !== ''
      if (keysToRemove.includes(key)) return false
      return true
    })
  )
}

export const removePrefixFields = (data: Record<string, any>, prefix: string) => {
  const prefixLength = prefix.length + 1 // +1 for the underscore
  const result: Record<string, any> = {}

  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith(`${prefix}_`)) {
      const newKey = key.slice(prefixLength)
      result[newKey] = value
    }
  })

  return result
}

export const removeEmptyFields = (
  data: Record<string, any>,
  keysToRemove: string[] = []
): Record<string, any> => {
  const result: Record<string, any> = {}

  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      continue
    }

    if (keysToRemove.includes(key)) {
      continue
    }

    const value = data[key]

    if (value === undefined || value === null) {
      continue
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim()
      if (trimmedValue !== '') {
        result[key] = trimmedValue
      }
      continue
    }

    if (Array.isArray(value)) {
      const cleanedArray: (string | number | object)[] = []
      for (const item of value) {
        let cleanedItem = item

        if (typeof item === 'object' && item !== null) {
          cleanedItem = removeEmptyFields(item, keysToRemove)
          if (Object.keys(cleanedItem).length === 0) {
            continue
          }
        }

        if (
          cleanedItem === undefined ||
          cleanedItem === null ||
          cleanedItem === '' ||
          (Array.isArray(cleanedItem) && cleanedItem.length === 0)
        ) {
          continue
        }

        cleanedArray.push(cleanedItem)
      }

      if (cleanedArray.length > 0) {
        result[key] = cleanedArray
      }
      continue
    }

    if (typeof value === 'object') {
      const cleanedObject = removeEmptyFields(value, keysToRemove)
      if (Object.keys(cleanedObject).length > 0) {
        result[key] = cleanedObject
      }
      continue
    }

    // For all other data types (number, boolean, etc.)
    result[key] = value
  }

  return result
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

export function mergeDirtyValues(dirtyFields, currentValues, newData) {
  if (typeof dirtyFields === 'boolean' && dirtyFields) {
    // Field is dirty, use the value from currentValues
    return currentValues
  } else if (Array.isArray(newData)) {
    return newData.map((newItem, index) => {
      return mergeDirtyValues(
        dirtyFields ? dirtyFields[index] : undefined,
        currentValues ? currentValues[index] : undefined,
        newItem
      )
    })
  } else if (typeof newData === 'object' && newData !== null) {
    const result = { ...newData }
    for (const key in newData) {
      result[key] = mergeDirtyValues(
        dirtyFields ? dirtyFields[key] : undefined,
        currentValues ? currentValues[key] : undefined,
        newData[key]
      )
    }
    return result
  } else {
    // Primitive value, return as is
    return newData
  }
}

import { RowData } from './types'

const isPlainObject = (value: any): value is Record<string, any> => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const flattenObject = (
  obj: Record<string, any>,
  parentKey: string = '',
  res: Record<string, any> = {}
): Record<string, any> => {
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key
    if (Array.isArray(value)) {
      if (value.length > 0 && isPlainObject(value[0])) {
        value.forEach((item) => {
          Object.entries(item).forEach(([subKey, subValue]) => {
            const arrayKey = `${newKey}.${subKey}`
            if (!res[arrayKey]) res[arrayKey] = []
            res[arrayKey].push(subValue)
          })
        })
      } else res[newKey] = value
    } else if (isPlainObject(value)) {
      // Recursively flatten if the value is a non-array object
      flattenObject(value, newKey, res)
    } else {
      res[newKey] = value
    }
  })

  return res
}

// Flatten the data array while skipping the Copies array
export const flattenData = (data: RowData[]): RowData[] => {
  return data.map((item) => {
    const { Copies, ...rest } = item
    const flattened = flattenObject(rest) // Flatten all fields except Copies
    flattened['Copies'] = Copies // Re-add Copies as-is to handle separately
    return flattened
  })
}

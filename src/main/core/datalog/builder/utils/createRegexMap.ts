import { Field } from '@shared/projectTypes'

/**
 * Used for pre-compiling the clip regex. If no regex is set, null is returned.
 * @param regex settings.clip.regex
 * @returns regex | null
 * @throws Will throw an error if regex pattern is invalid.
 */
export const createClipRegex = async (regex?: string): Promise<RegExp | null> => {
  if (regex) {
    try {
      const clipRegex = new RegExp(regex)
      return clipRegex
    } catch (error) {
      throw new Error(`Invalid regex pattern for Clip column: ${regex}`)
    }
  } else return null
}

/**
 * Creates a map of field keys to their corresponding compiled regex patterns.
 * @param fields - An array of field configurations from project settings.
 * @returns A promise that resolves to a map where keys are field value_keys and values are RegExp objects or null.
 * @throws Will throw an error if any regex pattern is invalid.
 */
export const createFieldRegexMap = async (
  fields: Field[]
): Promise<Record<string, RegExp | null>> => {
  const fieldRegexMap: Record<string, RegExp | null> = {}

  for (const field of fields) {
    if (field.type === 'string') {
      const { value_key, regex } = field

      if (regex) {
        try {
          fieldRegexMap[value_key] = new RegExp(regex)
        } catch (error) {
          throw new Error(`Invalid regex pattern in field "${value_key}": ${regex}`)
        }
      } else {
        fieldRegexMap[value_key] = null
      }
    }
  }

  return fieldRegexMap
}

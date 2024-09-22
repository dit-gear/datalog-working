import {
  subFieldsType,
  Field,
  timeUnitsType,
  StringFieldType,
  ListOfStringsFieldType,
  KeyValueObjFieldType,
  ListOfFieldArraysFieldType,
  ListOfMappedObjectsFieldType,
  DurationFieldType
} from '@shared/projectTypes'
import { parseString } from './parse-string'
import { parseNumber } from './parse-number'
import { timecodeToTime } from '../utils/convertTimecode'

/*

STRING

A single string value representing unstructured text that doesn't require parsing into smaller components.
The parser treats the entire string as a single value. If a valid regex is present, the string will be formatted using the regex.

input: "Action!"
output: "Action!"

regex: /!$/
output: "Action"


LIST OF STRINGS

A delimited string representing a list of strings without internal structure or keys
The parser splits the string using a delimiter to create an array of strings.

input: "applebox,boom,clapperboard"
output: ['applebox', 'boom', 'clapperboard']



KEY-VALUE OBJECT

A string containing key-value pairs that are parsed into an object with corresponding keys and values.
The parser processes each pair to build an object where keys map to their corresponding values.

input: "Location:Studio 1;UserInfo1:bananas, oat milk, 12 eggs, avocados (ripe, but not too ripe);"
output: {
  Location: 'Studio 1',
  UserInfo1: 'bananas, oat milk, 12 eggs, avocados (ripe, but not too ripe)'
}



LIST OF FIELD ARRAYS

A string representing multiple records, where each record is a list of fields without keys, and no mapping to predefined keys is required.
The parser splits the input into records, then splits each record into an array of fields.

input: "Johnny|Bravo|Gaffer|Frequently uses a flashlight to check if lights are on,Jane|Doe|Video Assist|Brings 500ft of BNC but always ends up 3ft short"
output: [
  ['Johnny', 'Bravo', 'Gaffer', 'Frequently uses a flashlight to check if lights are on'],
  ['Jane', 'Doe', 'Video Assist', 'Brings 500ft of BNC but always ends up 3ft short']
]



LIST OF MAPPED OBJECTS

A string containing multiple records without keys, where each record's fields are mapped to predefined keys during parsing.
The parser splits the input into records, then splits each record into fields, and maps these fields to the predefined keys.

input: "25:25:25.25|0|Operator fell asleep. Shot turned into 20 minutes of clouds,01:23:45.67|5|Camera overheated from director’s 99th retake of actor pouring coffee. Director still not satisfied"
output: [
  {
    TC: '25:25:25.25',
    urgency: '0',
    issue: 'Operator fell asleep. Shot turned into 20 minutes of clouds'
  },
  {
    TC: '01:23:45.67',
    urgency: '5',
    issue:
      'Camera overheated from director’s 99th retake of actor pouring coffee. Director still not satisfied'
  },
]

  */

type Row = Record<string, string | undefined>
type DataRow = Record<string, unknown>

function handleString(
  field: StringFieldType,
  row: Row,
  dataRow: DataRow,
  fieldRegexMap: { [key: string]: RegExp | null }
): string {
  const { value_key, column } = field
  const value = row[column] ?? ''
  const regex = fieldRegexMap[value_key]
  return (dataRow[value_key] = parseString(value, regex))
}

function parseListOfStrings(field: ListOfStringsFieldType, row, dataRow): string[] {
  const { value_key, column, delimiter } = field
  const value = row[column] ?? ''

  if (delimiter !== undefined) {
    return (dataRow[value_key] = value.split(delimiter))
  } else {
    // Define common separators
    const separators = [',', ';', '|', '\t', ' ', ':']

    // Function to escape special regex characters
    function escapeRegExp(s: string): string {
      return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    }

    // Count occurrences of each separator
    const counts: { [key: string]: number } = {}
    for (const sep of separators) {
      const regex = new RegExp(escapeRegExp(sep), 'g')
      const matches = value.match(regex)
      counts[sep] = matches ? matches.length : 0
    }

    // Find the separator with the maximum count
    let maxCount = 0
    let maxSeparator = ''
    for (const sep of separators) {
      if (counts[sep] > maxCount) {
        maxCount = counts[sep]
        maxSeparator = sep
      }
    }

    // If no separator is found, return the original string in an array
    if (maxCount === 0) {
      return (dataRow[value_key] = [value])
    } else {
      return (dataRow[value_key] = value.split(maxSeparator))
    }
  }
}

function parseKeyValueString(
  field: KeyValueObjFieldType,
  row: Row,
  dataRow: DataRow
): { [key: string]: string | null } {
  const { value_key, column, primary_delimiter = ';', secondary_delimiter = ':' } = field
  const value = row[column] ?? ''

  const result: { [key: string]: string | null } = {}
  const pairs = value.split(primary_delimiter)

  for (const pair of pairs) {
    if (pair.trim() === '') {
      continue // Skip empty pairs resulting from trailing semicolons
    }

    const [key, value] = pair.split(secondary_delimiter, 2).map((s) => s.trim())

    if (key) {
      result[key] = value !== undefined && value !== '' ? value : null
    }
  }

  return (dataRow[value_key] = result)
}

function parseListOfFieldArrays(
  field: ListOfFieldArraysFieldType,
  row: Row,
  dataRow: DataRow
): string[][] {
  const { value_key, column, primary_delimiter = ',', secondary_delimiter = '|' } = field
  const value = row[column] ?? ''
  // Split the input string into records using the record delimiter
  const records = value.split(primary_delimiter)

  // Map each record to an array of fields
  const result: string[][] = records.map((record) => {
    // Trim the record to remove leading/trailing whitespace
    record = record.trim()

    // Split the record into fields using the field delimiter
    const fields = record.split(secondary_delimiter).map((field) => field.trim())

    return fields
  })

  return (dataRow[value_key] = result)
}

function parseListOfMappedObjects(
  field: ListOfMappedObjectsFieldType,
  row: Row,
  dataRow: DataRow
): string[][] | Record<string, string>[] {
  const { value_key, column, subfields, primary_delimiter = ',', secondary_delimiter = '|' } = field
  const value = row[column] ?? ''

  const fieldMapping = subfields.map((sub) => sub.value_key)

  const records = value.split(primary_delimiter)

  return records.map((record) => {
    const fields = record.split(secondary_delimiter).map((field) => field.trim())
    const mappedObject: Record<string, string> = {}
    fields.forEach((field, index) => {
      const key = fieldMapping[index]
      if (key) {
        mappedObject[key] = field
      }
    })
    return (dataRow[value_key] = mappedObject)
  })
}

function parseDuration(field: DurationFieldType, row: Row, dataRow: DataRow): number {
  const { column, unit, fps } = field
  const value = row[column] ?? ''
  const valueAsNumber = parseNumber(value)
  let durationInSeconds = 0
  let fpsValue
  if (fps) {
    let fpscolumn = row[fps] ?? ''
    fpsValue = parseNumber(fpscolumn)
  }
  switch (unit) {
    case 'ms':
      return valueAsNumber / 1000
    case 's':
      return valueAsNumber * 1000
    case 'frames':
      if (fpsValue) {
        return valueAsNumber / fpsValue
      } else {
        throw new Error('FPS value is required to parse frames.')
      }
      break
    case 'tc':
      if (fpsValue) {
        timecodeToTime(value, fpsValue, 'ms')
        const [hours, minutes, seconds, frames] = value.split(':').map(Number)
        durationInSeconds = hours * 3600 + minutes * 60 + seconds + frames / fpsValue
      } else {
        throw new Error('FPS value is required to parse timecode.')
      }
      break
    default:
      throw new Error(`Unsupported unit type: ${unit}`)
  }

  return (dataRow.Duration = durationInSeconds)
}

type returnType =
  | string
  | string[]
  | { [key: string]: string | null }
  | string[][]
  | Record<string, string>[]
  | number

export function parseField(
  field: Field,
  row: Row,
  dataRow: DataRow,
  fieldRegexMap: { [key: string]: RegExp | null }
): returnType {
  const { type } = field
  switch (type) {
    case 'string':
    default:
      return handleString(field, row, dataRow, fieldRegexMap)
    case 'list_of_strings':
      return parseListOfStrings(field, row, dataRow)
    case 'key-value_object':
      return parseKeyValueString(field, row, dataRow)
    case 'list_of_field_arrays':
      return parseListOfFieldArrays(field, row, dataRow)
    case 'list_of_mapped_objects':
      return parseListOfMappedObjects(field, row, dataRow)
    case 'duration':
      return parseDuration(field, row, dataRow)
  }
}

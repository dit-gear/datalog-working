import { ResponseWithClips } from '@shared/datalogTypes'
import { dialog } from 'electron'
import fs from 'fs'
import Papa from 'papaparse'
import { getBuilderClips, setBuilderClips } from './builder-state'
import { getActiveProject } from '../../app-state/state'
import logger from '../../logger'
import chardet from 'chardet'
import iconv from 'iconv-lite'
import { parseField } from '../../file-processing/csv/parse-csv-column'
import { parseString } from '../../file-processing/csv/parse-string'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const parseCsv = async (path?: string): Promise<ResponseWithClips> => {
  try {
    const settings = getActiveProject()?.additional_parsing

    if (
      !Array.isArray(settings?.fields) ||
      settings.fields.length === 0 ||
      !settings.fields.every((field) => typeof field === 'object' && field !== null)
    ) {
      const message = 'Settings fields is empty or does not contain valid objects'
      logger.warn(message)
      return {
        success: false,
        error: message
      }
    }

    // Prompt user to select a CSV file if path is not provided
    if (!path) {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select a CSV file',
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
        properties: ['openFile']
      })
      if (canceled) return { success: false, error: 'User cancelled operation', cancelled: true }
      path = filePaths[0]
    }

    // Check file size
    const stats = await fs.promises.stat(path)
    if (stats.size > MAX_FILE_SIZE) {
      const message = 'CSV file is too large'
      logger.warn(message)
      return { success: false, error: message }
    }

    // Read the file as a buffer
    const buffer = await fs.promises.readFile(path)

    // Detect the encoding
    const detectedEncoding = chardet.detect(buffer) || 'utf8'

    // Decode the buffer using iconv-lite
    const data = iconv.decode(buffer, detectedEncoding)

    // Parse the CSV data
    const parsed = await new Promise<Papa.ParseResult>((resolve, reject) => {
      Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult) => resolve(results),
        error: (err: Error) => reject(err)
      })
    })

    /*for (const row of parsed.data) {
      const dataRow: any = {}
      for (const field of settings.fields) {
        const { value_key, column, type, subfields, options } = field
        const value = row[column]
        dataRow[value_key] = parseValue(value, type, subfields, options)
      }
    }*/

    const clips = getBuilderClips()

    // Pre-compile the regex for `settings.clip.regex`, if available
    let clipRegex: RegExp | null = null
    if (settings.clip.regex) {
      try {
        clipRegex = new RegExp(settings.clip.regex) // Compile clip regex once
      } catch (error) {
        throw new Error(`Invalid regex pattern for Clip column: ${settings.clip.regex}`)
      }
    }

    // Pre-compile regex patterns for each field if available, and store them in a map
    const fieldRegexMap: { [key: string]: RegExp | null } = {}
    for (const field of settings.fields) {
      if (field.type === 'string') {
        const { value_key, regex } = field

        if (regex) {
          try {
            fieldRegexMap[value_key] = new RegExp(regex) // Compile regex once per field
          } catch (error) {
            throw new Error(`Invalid regex pattern in field ${value_key}: ${regex}`)
          }
        } else {
          fieldRegexMap[value_key] = null // No regex for this field
        }
      }
    }

    for (const row of parsed.data) {
      let clipcolumn: string | undefined = row[settings.clip.column]
      if (!clipcolumn) continue

      // Use the pre-compiled clip regex, if available
      if (clipRegex) {
        clipcolumn = parseString(clipcolumn, clipRegex)
      }

      // Find the corresponding clip in the `clips` array by matching the `Clip` field
      const matchingClipIndex = clips.findIndex((c) => c.Clip === clipcolumn)

      if (matchingClipIndex === -1) continue

      const dataRow: Record<string, unknown> = {} // Create a dataRow object to hold new fields

      // Iterate over each field in the settings.fields array and extract/parse the values from the current row
      for (const field of settings.fields) {
        parseField(field, row, dataRow, fieldRegexMap)
      }

      // Check that `dataRow` doesn't contain keys that would overwrite Clip, Size, or Copies
      const forbiddenKeys = ['Clip', 'Size', 'Copies', 'Image', 'Proxy']
      const hasForbiddenKey = Object.keys(dataRow).some((key) => forbiddenKeys.includes(key))

      if (hasForbiddenKey) {
        throw new Error(`Attempt to overwrite forbidden fields`)
      }
      console.log(dataRow)
      // Update the matched Clip with the additional `dataRow` fields
      clips[matchingClipIndex] = {
        ...clips[matchingClipIndex],
        ...dataRow // Spread the `dataRow` into the matched clip to add the new fields
      }
    }
    setBuilderClips(clips)
    return { success: true, clips }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    logger.error(message)
    console.error(message)
    return { success: false, error: message }
  }
}

export default parseCsv

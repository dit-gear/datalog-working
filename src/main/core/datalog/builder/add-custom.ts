import type { ResponseWithClips, CustomType, OcfClipType } from '@shared/datalogTypes'
import fs from 'fs'
import Papa from 'papaparse'
import chardet from 'chardet'
import iconv from 'iconv-lite'
import { parseField } from '../../file-processing/csv/parse-csv-column'
import { parseString } from '../../file-processing/csv/parse-string'
import { createClipRegex, createFieldRegexMap } from './utils/createRegexMap'
import type { additionalParsing } from '@shared/projectTypes'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface addCustomProps {
  paths: string | string[]
  storedClips: OcfClipType[]
  custom_fields?: additionalParsing
}

const addCustom = async ({
  paths,
  storedClips,
  custom_fields
}: addCustomProps): Promise<ResponseWithClips> => {
  try {
    const store = new Map<string, OcfClipType>(storedClips.map((clip) => [clip.clip, clip]))
    const path = Array.isArray(paths) ? paths[0] : paths

    if (
      !Array.isArray(custom_fields?.fields) ||
      custom_fields.fields.length === 0 ||
      !custom_fields.fields.every((field) => typeof field === 'object' && field !== null)
    ) {
      const message = 'Settings fields is empty or does not contain valid objects'
      console.warn(message)
      return {
        success: false,
        error: message
      }
    }

    // Check file size
    const stats = await fs.promises.stat(path)
    if (stats.size > MAX_FILE_SIZE) {
      const message = 'CSV file is too large'
      console.warn(message)
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

    // Pre-compile the regex for `settings.clip.regex`, if available
    const clipRegex = await createClipRegex(custom_fields.clip.regex)

    // Pre-compile regex patterns for each field if available, and store them in a map
    const fieldRegexMap = await createFieldRegexMap(custom_fields.fields)

    let customClips: CustomType[] = []

    for (const row of parsed.data) {
      let clipcolumn: string | undefined = row[custom_fields.clip.column]
      if (!clipcolumn) continue

      // Use the pre-compiled clip regex, if available
      clipRegex && (clipcolumn = parseString(clipcolumn, clipRegex))

      const matchingOcfClip = store.get(clipcolumn)
      if (!matchingOcfClip) continue

      const dataRow: Record<string, unknown> = {} // Create a dataRow object to hold new fields

      // Iterate over each field in the settings.fields array and extract/parse the values from the current row
      for (const field of custom_fields.fields) {
        parseField(field, row, dataRow, fieldRegexMap)
      }

      // Check that `dataRow` doesn't contain keys that would overwrite Clip, Size, or Copies
      const forbiddenKeys = ['Clip', 'Size', 'Copies', 'Image', 'Proxy']
      const hasForbiddenKey = Object.keys(dataRow).some((key) => forbiddenKeys.includes(key))

      if (hasForbiddenKey) {
        throw new Error(`Attempt to overwrite forbidden fields`)
      }

      customClips.push({
        clip: matchingOcfClip.clip,
        ...dataRow
      })
    }

    return { success: true, clips: { custom: customClips } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(message)
    return { success: false, error: message }
  }
}

export default addCustom

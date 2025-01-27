import { ResponseWithClips, CustomType } from '@shared/datalogTypes'
import { dialog } from 'electron'
import fs from 'fs'
import Papa from 'papaparse'
import logger from '../../logger'
import chardet from 'chardet'
import iconv from 'iconv-lite'
import { parseField } from '../../file-processing/csv/parse-csv-column'
import { parseString } from '../../file-processing/csv/parse-string'
import { createClipRegex, createFieldRegexMap } from './utils/createRegexMap'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const addCustom = async (path: string): Promise<ResponseWithClips> => {
  try {
    const settings = appState.activeProject?.custom_fields

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

    // Pre-compile the regex for `settings.clip.regex`, if available
    const clipRegex = await createClipRegex(settings.clip.regex)

    // Pre-compile regex patterns for each field if available, and store them in a map
    const fieldRegexMap = await createFieldRegexMap(settings.fields)

    let customClips: CustomType[] = []

    for (const row of parsed.data) {
      let clipcolumn: string | undefined = row[settings.clip.column]
      if (!clipcolumn) continue

      // Use the pre-compiled clip regex, if available
      clipRegex && (clipcolumn = parseString(clipcolumn, clipRegex))

      const matchingOcfClip = ocfClipsStore().get(clipcolumn)
      if (!matchingOcfClip) continue

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

      customClips.push({
        clip: matchingOcfClip.clip,
        ...dataRow
      })
    }

    return { success: true, clips: { custom: customClips } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    logger.error(message)
    console.error(message)
    return { success: false, error: message }
  }
}

export default addCustom

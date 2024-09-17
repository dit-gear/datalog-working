import { ResponseWithClips } from '@shared/datalogTypes'
import { dialog } from 'electron'
import fs from 'fs'
import Papa from 'papaparse'
import { getBuilderClips, setBuilderClips } from './builder-state'
import logger from '../../logger'
import chardet from 'chardet'
import iconv from 'iconv-lite'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const parseCsv = async (path?: string): Promise<ResponseWithClips> => {
  try {
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
      return { success: false, error: 'File is too large' }
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
        complete: (results) => resolve(results),
        error: (err) => reject(err)
      })
    })

    // Return the parsed clips data
    return { success: true, clips: parsed.data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    logger.error(error)
    return { success: false, error: message }
  }
}

export default parseCsv

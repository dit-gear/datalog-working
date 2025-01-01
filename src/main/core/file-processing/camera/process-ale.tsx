import Papaparse from 'papaparse'
import fs from 'fs'
import { ClipType, ClipZod } from '@shared/datalogTypes'
import { timecodeToTime } from '../utils/convertTimecode'
import { alexaAleZod, alexaAleType } from './types'

async function processALE(filePaths: string[]): Promise<ClipType[]> {
  const parseFile = async (filePath: string): Promise<ClipType[]> => {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8')
      const lines = data.split('\n')

      const headerIndex = lines.findIndex(
        (line) => line.includes('Name') && line.includes('Reel_name')
      )
      if (headerIndex === -1) throw new Error('Header row not found')

      // Slice from the header onwards, filtering unnecessary lines
      const records = lines
        .slice(headerIndex)
        .filter((line) => !line.startsWith('Data'))
        .join('\n')

      return new Promise((resolve, reject) => {
        Papaparse.parse(records, {
          delimiter: '\t',
          skipEmptyLines: true,
          header: true,
          transformHeader: (header) => header.trim().replace(/\s+/g, '_').toLowerCase(), // Normalize headers
          complete: (results) => {
            // Validate each row using Zod's safeParse
            const validData = results.data
              .map((item: unknown) => {
                const validationResult = alexaAleZod.safeParse(item)
                if (!validationResult.success) {
                  console.error('Validation failed:', validationResult.error)
                  return null
                }

                // Map fields for each row
                return mapFields(validationResult.data)
              })
              .filter(Boolean) as ClipType[]

            resolve(validData)
          },
          error: (error) => reject(error)
        })
      })
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err)
      return []
    }
  }

  // Helper function to map parsed data
  const mapFields = (item: alexaAleType): Partial<ClipType> => {
    const result: Partial<ClipType> = {}

    const NotEmpty = (...sources: (string | undefined)[]): Boolean => {
      return sources.every((source) => !!(source && source.trim() !== ''))
    }
    // Assign the fields directly based on the desired mappings
    result.clip = item.name

    if (NotEmpty(item.manufacturer, item.camera_model))
      result.camera_model = `${item.manufacturer} ${item.camera_model}`
    if (NotEmpty(item.camera_id)) result.camera_id = item.camera_id
    if (NotEmpty(item.reel_name)) result.reel = item.reel_name
    if (NotEmpty(item.fps)) result.fps = item.fps
    if (NotEmpty(item.sensor_fps)) result.sensor_fps = item.sensor_fps
    if (NotEmpty(item.lens_type)) result.lens = item.lens_type
    if (NotEmpty(item.frame_width, item.frame_height))
      result.resolution = `${item.frame_width}x${item.frame_height}`
    if (NotEmpty(item.original_video))
      result.codec = item.original_video?.replace(/\(.*?\)/g, '').trim()
    if (NotEmpty(item.gamma)) result.gamma = item.gamma
    if (NotEmpty(item.white_balance)) result.wb = item.white_balance
    if (NotEmpty(item.cc_shift)) result.tint = item.cc_shift
    if (NotEmpty(item.look_name)) result.lut = item.look_name

    // Special handling for duration based on FPS
    if (item.duration && item.fps) {
      const FPS = parseFloat(item.fps)
      if (item.duration.includes(':') && !isNaN(FPS)) {
        result.duration = timecodeToTime(item.duration, FPS)
      }
    }
    return result
  }

  // Process all files in parallel
  const fileResults = await Promise.all(filePaths.map(parseFile))

  // Flatten the results and return
  return fileResults.flat()
}

export default processALE

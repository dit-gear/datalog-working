import Papaparse from 'papaparse'
import fs from 'fs'
import { CameraMetadataType, CameraMetadataZod } from '@shared/datalogTypes'
import { alexaAleZod, alexaAleType } from './types'

const NotEmpty = (...sources: (string | undefined)[]): Boolean => {
  return sources.every((source) => !!(source && source.trim() !== ''))
}

const mapFields = (item: alexaAleType): CameraMetadataType => {
  const result: Partial<Omit<CameraMetadataType, 'fps'> & { fps?: string }> = {}

  // Assign the fields directly based on the desired mappings
  result.clip = item.name

  if (NotEmpty(item.start)) result.tc_start = item.start
  if (NotEmpty(item.end)) result.tc_end = item.end
  if (NotEmpty(item.duration)) result.duration = item.duration
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

  const field = CameraMetadataZod.parse(result)
  return field
}

const parseFile = async (filePath: string): Promise<CameraMetadataType[]> => {
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
        transformHeader: (header: any) => header.trim().replace(/\s+/g, '_').toLowerCase(), // Normalize headers
        complete: (results: any) => {
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
            .filter(Boolean)

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

async function processALE(filePaths: string[]): Promise<CameraMetadataType[]> {
  // Process all files in parallel
  const fileResults = await Promise.all(filePaths.map(parseFile))
  // Flatten the results and return
  return fileResults.flat()
}

export default processALE

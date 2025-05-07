import Papaparse from 'papaparse'
import fs from 'fs'
import { CameraMetadataType } from '@shared/datalogTypes'
import { alexaAleZod } from './schemas/alexa'

async function parseALEFile(filePath: string): Promise<CameraMetadataType[] | null> {
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
          const validData = results.data
            .map((item: unknown) => {
              const validationResult = alexaAleZod.safeParse(item)
              if (!validationResult.success) {
                console.error('Validation failed:', validationResult.error)
                return null
              }
              return validationResult.data
            })
            .filter(Boolean)

          resolve(validData)
        },
        error: (error) => reject(error)
      })
    })
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err)
    return null
  }
}

async function processALE(filePaths: string[]): Promise<CameraMetadataType[]> {
  const fileResults = await Promise.all(filePaths.map(parseALEFile))
  return fileResults.filter((item): item is CameraMetadataType[] => item !== null).flat()
}

export default processALE

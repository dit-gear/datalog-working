import { CameraMetadataType } from '@shared/datalogTypes'
import { parseXML } from '../utils/xml-parser'
import fs from 'fs'
import { VeniceNamespaceSchema, VeniceMetaSchema } from './schemas/venice'

async function processXML(filePaths: string[]): Promise<CameraMetadataType[]> {
  const fileResults = await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const data = await fs.promises.readFile(filePath, 'utf8')
        const xml = await parseXML(data)
        const nsCheck = VeniceNamespaceSchema.safeParse(xml)
        if (nsCheck.success) {
          const result = VeniceMetaSchema.safeParse([xml, filePath])
          if (!result.success) {
            console.error('Validation failed for', filePath, result.error)
            return null
          }
          return result.data
        } else {
          console.warn(`Skipping ${filePath}: unsupported namespace`)
          return null
        }
      } catch (err) {
        console.error(`Error processing XML file ${filePath}:`, err)
        return null
      }
    })
  )
  return fileResults.filter((item): item is CameraMetadataType => item !== null)
}

export default processXML

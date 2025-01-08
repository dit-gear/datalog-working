import { dialog } from 'electron'
import logger from '../../logger'
import findFilesByType from '../../../utils/find-files-by-type'
import processMHL from '../../file-processing/mhl/process-mhl'
import processALE from '../../file-processing/camera/process-ale'
import { ocfClipsStore } from './builder-state'
import { CameraMetadataType, OcfClipBaseType, ResponseWithClips } from '@shared/datalogTypes'

const ParseCameraMetadata = async (filePath: string): Promise<CameraMetadataType[]> => {
  const [aleFiles, xmlFiles] = await Promise.all([
    findFilesByType(filePath, 'ale'),
    findFilesByType(filePath, 'xml')
  ])

  // Initialize data arrays
  let aleData: CameraMetadataType[] = []
  let xmlData: CameraMetadataType[] = []

  if (aleFiles.length > 0) {
    aleData = await processALE(aleFiles)
  }

  if (xmlFiles.length > 0) {
    //xmlData = await processXML(xmlFiles)
  }
  return [...aleData, ...xmlData]
}

const ParseOCF = async (paths: string[] = []): Promise<ResponseWithClips> => {
  try {
    if (paths.length === 0) {
      const result = await dialog.showOpenDialog({
        title: 'Select an OCF path',
        properties: ['openDirectory']
      })

      if (result.canceled)
        return { success: false, error: 'User cancelled operation', cancelled: true }
      paths = [result.filePaths[0]]
    }

    // We'll accumulate new clips and metadata before updating state
    let newClips: OcfClipBaseType[] = []

    await Promise.all(
      paths.map(async (path) => {
        const mhlFiles = await findFilesByType(path, 'mhl')

        if (mhlFiles.length === 0) {
          const message = 'No MHL files found in the selected directory.'
          dialog.showErrorBox('Error', message)
          return
        }

        const mhlData = await processMHL(mhlFiles, path)

        // Handle Copies merging
        mhlData.forEach((newClip) => {
          let existingClip = ocfClipsStore().get(newClip.clip)

          if (existingClip) {
            // If the clip already exists, merge the Copies
            existingClip.copies = [
              ...existingClip.copies,
              ...newClip.copies.filter(
                (copy) =>
                  !existingClip.copies.some((existingCopy) => existingCopy.path === copy.path)
              )
            ]
            ocfClipsStore().set(existingClip.clip, existingClip)
          } else {
            // If the clip doesn't exist, add it to the list of new clips
            newClips.push(newClip)
          }
        })
      })
    )

    let cameraMetadata: CameraMetadataType[] = []
    if (newClips.length > 0) {
      const path = paths[0]
      cameraMetadata = await ParseCameraMetadata(path)
    }

    // merge aleData and data that have the same Clip name
    const mergedWithMetadata = newClips.map((item) => {
      const cameraMetadataItem = cameraMetadata.find((camera) => camera.clip === item.clip)
      return { ...cameraMetadataItem, ...item }
    })

    mergedWithMetadata.map((item) => {
      ocfClipsStore().set(item.clip, item)
    })

    return { success: true, clips: { ocf: Array.from(ocfClipsStore().values()) } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    logger.error(`Error parsing OCF: ${message}`)
    return { success: false, error: message }
  }
}

export default ParseOCF

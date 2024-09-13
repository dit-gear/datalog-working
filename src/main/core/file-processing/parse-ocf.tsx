import { dialog } from 'electron'
import logger from '../logger'
import findFilesByType from '../../utils/find-files-by-type'
import processMHL from './mhl/process-mhl'
import processALE from './camera/process-ale'
import { getActiveProject, setActiveProject } from '../app-state/state'
import { getNewEntryClips, setNewEntryClips } from '../entries/newentry-state'
import { ClipType } from '@shared/datalogTypes'
import { getMainWindow } from 'src/main'

const ParseCameraMetadata = async (filePath: string): Promise<ClipType[]> => {
  const [aleFiles, xmlFiles] = await Promise.all([
    findFilesByType(filePath, 'ale'),
    findFilesByType(filePath, 'xml')
  ])

  // Initialize data arrays
  let aleData: ClipType[] = []
  let xmlData: ClipType[] = []

  if (aleFiles.length > 0) {
    aleData = await processALE(aleFiles)
  }

  if (xmlFiles.length > 0) {
    //xmlData = await processXML(xmlFiles)
  }
  return [...aleData, ...xmlData]
}

const ParseOCF = async (paths: string[] = []): Promise<ClipType[] | void> => {
  try {
    if (paths.length === 0) {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })

      if (result.canceled) return
      paths = [result.filePaths[0]]
    }

    const existingClips = getNewEntryClips()

    // Create a map of existing clips for fast lookup
    const existingClipMap = new Map<string, ClipType>(
      existingClips.map((clip) => [clip.Clip, clip])
    )

    // We'll accumulate new clips and metadata before updating state
    let newClips: ClipType[] = []

    await Promise.all(
      paths.map(async (path) => {
        const mhlFiles = await findFilesByType(path, 'mhl')

        if (mhlFiles.length === 0) {
          dialog.showErrorBox('Error', 'No MHL files found in the selected directory.')
          return
        }

        const mhlData = await processMHL(mhlFiles, path)

        // Handle Copies merging
        mhlData.forEach((newClip) => {
          const existingClip = existingClipMap.get(newClip.Clip)

          if (existingClip) {
            // If the clip already exists, merge the Copies
            existingClip.Copies = [
              ...existingClip.Copies,
              ...newClip.Copies.filter(
                (copy) =>
                  !existingClip.Copies.some((existingCopy) => existingCopy.Path === copy.Path)
              )
            ]
          } else {
            // If the clip doesn't exist, add it to the list of new clips
            newClips.push(newClip)
          }
        })
      })
    )

    const shouldParseCameraMetadata = getActiveProject()?.parse_camera_metadata
    const parseCameraMetadataEnabled =
      shouldParseCameraMetadata != null && shouldParseCameraMetadata === false

    let cameraMetadata: ClipType[] = []
    if (parseCameraMetadataEnabled && newClips.length > 0) {
      const path = paths[0]
      cameraMetadata = await ParseCameraMetadata(path)
    }

    // merge aleData and data that have the same Clip name
    const mergedWithMetadata = newClips.map((item) => {
      const cameraMetadataItem = cameraMetadata.find((camera) => camera.Clip === item.Clip)
      return { ...cameraMetadataItem, ...item }
    })
    const updatedClips = [
      ...existingClips.map((clip) => existingClipMap.get(clip.Clip) || clip), // Update existing clips with merged Copies
      ...mergedWithMetadata // Add newly parsed clips
    ]
    setNewEntryClips(updatedClips)
    return updatedClips
  } catch (error) {
    logger.error(`Error parsing OCF: ${error}`)
    return
  }
}

export default ParseOCF

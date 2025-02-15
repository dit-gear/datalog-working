import findFilesByType from '../../../utils/find-files-by-type'
import processMHL from '../../file-processing/mhl/process-mhl'
import processALE from '../../file-processing/camera/process-ale'
import type {
  CameraMetadataType,
  OcfClipBaseType,
  OcfClipType,
  ResponseWithClips
} from '@shared/datalogTypes'

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

interface addOCFProps {
  paths: string[]
  storedClips: OcfClipType[]
}

const addOCF = async ({ paths, storedClips }: addOCFProps): Promise<ResponseWithClips> => {
  console.log('addOCF started, recieved paths:', paths)
  try {
    // We'll accumulate new clips and metadata before updating state
    const store = new Map<string, OcfClipType>(storedClips.map((clip) => [clip.clip, clip]))

    let newClips: OcfClipBaseType[] = []

    await Promise.all(
      paths.map(async (path) => {
        const mhlFiles = await findFilesByType(path, 'mhl')

        if (mhlFiles.length === 0) {
          const message = 'No MHL files found in the selected directory.'
          console.log(message)
          return
        }

        const mhlData = await processMHL(mhlFiles, path, 'ocf')

        // Handle Copies merging
        mhlData.forEach((newClip) => {
          let existingClip = store.get(newClip.clip)

          if (existingClip) {
            // If the clip already exists, merge the Copies
            /*existingClip.copies = [
              ...existingClip.copies,
              ...newClip.copies.filter(
                (copy) =>
                  !existingClip.copies.some((existingCopy) => existingCopy.volume === copy.volume)
              )
            ]
            store.set(existingClip.clip, existingClip)*/
            existingClip.copies = [
              ...existingClip.copies,
              ...newClip.copies.filter(
                (copy) =>
                  !existingClip.copies.some((existingCopy) => existingCopy.volume === copy.volume)
              )
            ]
            store.set(existingClip.clip, existingClip)
          } else {
            // If the clip doesn't exist, add it to the list of new clips
            //newClips.push(newClip)
            store.set(newClip.clip, newClip)
          }
        })
      })
    )
    /*
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
      store.set(item.clip, item)
    })*/

    // Always fetch metadata from the first path (if available)
    let cameraMetadata: CameraMetadataType[] = []
    if (paths.length > 0) {
      cameraMetadata = await ParseCameraMetadata(paths[0])
    }

    // Merge metadata into every clip in the store
    store.forEach((clip, key) => {
      const cameraMetadataItem = cameraMetadata.find((camera) => camera.clip === key)
      if (cameraMetadataItem) {
        store.set(key, { ...cameraMetadataItem, ...clip })
      }
    })

    return { success: true, clips: { ocf: Array.from(store.values()) } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    return { success: false, error: message }
  }
}

export default addOCF

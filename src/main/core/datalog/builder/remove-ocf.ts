import { ocfClipsStore } from './builder-state'
import { OcfClipType, ResponseWithClips } from '@shared/datalogTypes'
import logger from '../../logger'

const removeOcf = async (volumes: string[]): Promise<ResponseWithClips> => {
  const ocfClipsMap = ocfClipsStore()

  try {
    const volSet = new Set(volumes)

    for (const [clipKey, clip] of ocfClipsMap.entries()) {
      const filteredCopies = clip.copies.filter((copy) => !volSet.has(copy.volume))

      if (filteredCopies.length > 0) {
        const updatedClip: OcfClipType = { ...clip, copies: filteredCopies }
        ocfClipsMap.set(clipKey, updatedClip)
      } else {
        ocfClipsMap.delete(clipKey)
      }
    }

    return { success: true, clips: { ocf: Array.from(ocfClipsStore().values()) } }
  } catch (error) {
    const message = `Error while trying to remove path: ${
      error instanceof Error ? error.message : 'Unknown issue'
    }`
    logger.error(message)
    return { success: false, error: message }
  }
}

export default removeOcf

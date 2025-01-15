import { ocfClipsStore, soundClipsStore } from './builder-state'
import { OcfClipType, SoundClipType, ResponseWithClips } from '@shared/datalogTypes'
import logger from '../../logger'

export const removeOcf = async (volumes: string[]): Promise<ResponseWithClips> => {
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

export const removeSound = async (volumes: string[]): Promise<ResponseWithClips> => {
  const soundClipsMap = soundClipsStore()

  try {
    const volSet = new Set(volumes)

    for (const [clipKey, clip] of soundClipsMap.entries()) {
      const filteredCopies = clip.copies.filter((copy) => !volSet.has(copy.volume))

      if (filteredCopies.length > 0) {
        const updatedClip: SoundClipType = { ...clip, copies: filteredCopies }
        soundClipsMap.set(clipKey, updatedClip)
      } else {
        soundClipsMap.delete(clipKey)
      }
    }

    return { success: true, clips: { sound: Array.from(soundClipsStore().values()) } }
  } catch (error) {
    const message = `Error while trying to remove path: ${
      error instanceof Error ? error.message : 'Unknown issue'
    }`
    logger.error(message)
    return { success: false, error: message }
  }
}

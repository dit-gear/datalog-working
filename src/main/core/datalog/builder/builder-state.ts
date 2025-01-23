import { OcfClipType, SoundClipType } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'

const ocfClips = new Map<string, OcfClipType>()
const soundClips = new Map<string, SoundClipType>()

export const ocfClipsStore = (): Map<string, OcfClipType> => ocfClips
export const soundClipsStore = (): Map<string, SoundClipType> => soundClips

export const clearClipsStore = async (): Promise<Response> => {
  try {
    ocfClips.clear()
    soundClips.clear()
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown error'
    return { success: false, error: msg }
  }
}

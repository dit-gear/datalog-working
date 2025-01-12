import { OcfClipType, SoundClipType } from '@shared/datalogTypes'

const ocfClips = new Map<string, OcfClipType>()
const soundClips = new Map<string, SoundClipType>()

export const ocfClipsStore = (): Map<string, OcfClipType> => ocfClips
export const soundClipsStore = (): Map<string, SoundClipType> => soundClips

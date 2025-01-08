import { OcfClipType, SoundClipType } from '@shared/datalogTypes'

const ocfClips = new Map<string, OcfClipType>()
let soundClips: SoundClipType[] = []

export const ocfClipsStore = (): Map<string, OcfClipType> => ocfClips

export const getSoundClips = (): SoundClipType[] => soundClips || []
export const setSoundClips = (newClips: SoundClipType[]): void => {
  soundClips = newClips
}

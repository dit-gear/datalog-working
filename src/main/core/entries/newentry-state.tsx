import { ClipType } from '@shared/datalogTypes'

let newEntryClips: ClipType[] = []

export const getNewEntryClips = (): ClipType[] => newEntryClips || []
export const setNewEntryClips = (newClips: ClipType[]): void => {
  newEntryClips = newClips
}

// Add function that updates renderer when NewEntryClips gets updated.

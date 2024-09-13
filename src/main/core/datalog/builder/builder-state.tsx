import { ClipType } from '@shared/datalogTypes'

let newEntryClips: ClipType[] = []

export const getBuilderClips = (): ClipType[] => newEntryClips || []
export const setBuilderClips = (newClips: ClipType[]): void => {
  newEntryClips = newClips
}

// Add function that updates renderer when NewEntryClips gets updated.

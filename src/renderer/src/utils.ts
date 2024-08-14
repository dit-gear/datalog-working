import { clipsType } from '@types'

export function timecodeToSeconds(timecode: string, frameRate: number): number {
  const parts = timecode.split(':').map(Number)

  if (parts.length !== 4) {
    throw new Error('Invalid timecode format')
  }

  const [hours, minutes, seconds, frames] = parts
  return Math.floor(hours * 3600 + minutes * 60 + seconds + frames / frameRate)
}

export function splitStringIntoArray(str: string): string[] {
  // Regular expression to match the timecode pattern and optional text after underscore
  const timecodeRegex = /\d{2}:\d{2}:\d{2}:\d{2}(?:_[^_\d{2}:]*)?/g

  // Find all matches for the timecode
  const timecodes = str.match(timecodeRegex)

  // If no timecodes are found, return the original string in an array
  if (!timecodes) {
    return [str]
  }

  // Process each timecode and following text
  const processedTimecodes = timecodes.map((timecodes) => {
    // Replace the first underscore with a hyphen and space, and remove any other underscores
    return timecodes.replace(/_/, ' - ').replace(/_/g, ' ')
  })

  // Split the string at each timecode
  const splitString = str.split(timecodeRegex)

  // Combine the split strings with their corresponding timecodes
  return splitString.reduce((acc: string[], text, index) => {
    text = text.trim()
    if (text) {
      acc.push(text)
    }
    if (index < processedTimecodes.length) {
      acc.push(processedTimecodes[index])
    }
    return acc
  }, [])
}

export const extractDay = (input: string) => {
  const regex = /D(\d+)/
  const match = input.match(regex)
  if (match && match[1]) {
    return match[1]
  } else {
    return input
  }
}

export const getVolumes = (clips: clipsType[]): string[] => {
  const volumesSet: Set<string> = new Set()

  for (const clip of clips) {
    for (const volume of clip.Volumes) {
      volumesSet.add(volume)
    }
  }

  return Array.from(volumesSet)
}
export const getReels = (clips: clipsType[]): string[] => {
  const reelsSet: Set<string> = new Set()

  for (const clip of clips) {
    if (clip.Reel) {
      reelsSet.add(clip.Reel)
    }
  }

  return Array.from(reelsSet)
}

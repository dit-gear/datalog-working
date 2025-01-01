import { ClipType } from '../datalogTypes'
import { z } from 'zod'

type ReelInfo = {
  reel: string
  prefix: string
  numeric: number | null
  suffix: string
}

function parseReel(reel: string): { prefix: string; numeric: number | null; suffix: string } {
  // Match the reel into prefix, numeric part, and suffix
  const match = reel.match(/^(.*?)(\d+)(.*)$/)
  if (match) {
    const prefix = match[1]
    const numeric = parseInt(match[2], 10)
    const suffix = match[3]
    return { prefix, numeric, suffix }
  } else {
    // If no numeric part is found, treat the entire reel as prefix
    return { prefix: reel, numeric: null, suffix: '' }
  }
}

function groupReels(reelsArray: string[]): string[] {
  const reelInfos: ReelInfo[] = []

  for (const reel of reelsArray) {
    const { prefix, numeric, suffix } = parseReel(reel)
    reelInfos.push({ reel, prefix, numeric, suffix })
  }

  // Sort reels by prefix, suffix, and numeric part
  reelInfos.sort((a, b) => {
    if (a.prefix !== b.prefix) {
      return a.prefix.localeCompare(b.prefix)
    }
    if (a.suffix !== b.suffix) {
      return a.suffix.localeCompare(b.suffix)
    }
    if (a.numeric !== null && b.numeric !== null) {
      return a.numeric - b.numeric
    } else if (a.numeric !== null) {
      return -1
    } else if (b.numeric !== null) {
      return 1
    } else {
      return a.reel.localeCompare(b.reel)
    }
  })

  const Reels: string[] = []

  if (reelInfos.length === 0) return Reels

  let startReelInfo = reelInfos[0]
  let previousReelInfo = startReelInfo

  for (let i = 1; i < reelInfos.length; i++) {
    const currentReelInfo = reelInfos[i]
    if (
      currentReelInfo.prefix === previousReelInfo.prefix &&
      currentReelInfo.suffix === previousReelInfo.suffix &&
      currentReelInfo.numeric !== null &&
      previousReelInfo.numeric !== null &&
      currentReelInfo.numeric === previousReelInfo.numeric + 1
    ) {
      // Continue grouping
      previousReelInfo = currentReelInfo
    } else {
      // Add the group
      if (startReelInfo.reel !== previousReelInfo.reel) {
        Reels.push(`${startReelInfo.reel} - ${previousReelInfo.reel}`)
      } else {
        Reels.push(startReelInfo.reel)
      }
      // Reset startReelInfo and previousReelInfo
      startReelInfo = currentReelInfo
      previousReelInfo = currentReelInfo
    }
  }

  // Push the last group or reel
  if (startReelInfo.reel !== previousReelInfo.reel) {
    Reels.push(`${startReelInfo.reel} - ${previousReelInfo.reel}`)
  } else {
    Reels.push(startReelInfo.reel)
  }
  return Reels
}

export const getReelsOptionsZod = z.object({ grouped: z.boolean().optional() }).optional()

export type getReelsOptions = z.infer<typeof getReelsOptionsZod>
/*export type getReelsOptions = {
  grouped?: boolean
}*/

export function getReels(clips: ClipType[] | string[], options: getReelsOptions = {}): string[] {
  const reelsSet: Set<string> = new Set()
  let clipsWithoutReel = 0
  if (clips.length > 0 && typeof clips[0] === 'string') {
    for (const clip of clips as string[]) {
      reelsSet.add(clip)
    }
  } else {
    for (const clip of clips as ClipType[]) {
      if (clip.reel) {
        reelsSet.add(clip.reel)
      } else {
        clipsWithoutReel++
      }
    }
  }
  const reelsArray = Array.from(reelsSet)

  if (!options.grouped) return reelsArray
  const groups = groupReels(reelsArray)
  if (clipsWithoutReel) {
    groups.push(`+ ${clipsWithoutReel} other clip${clipsWithoutReel > 1 ? 's' : ''}`)
  }

  return groups
}

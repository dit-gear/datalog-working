import { OcfClipType, SoundClipType, CopyType, CopyBaseType } from '@shared/datalogTypes'

export function getVolumeName(filePath: string): string | null {
  if (typeof filePath !== 'string') {
    return null
  }

  // Check if the file path starts with '/Volumes/' (external or mounted volumes)
  if (filePath.startsWith('/Volumes/')) {
    const parts = filePath.split('/')
    return parts.length > 2 ? parts[2] : null
  } else {
    // Check if the path is from the local system volume
    // Split the path and look for system root indications
    const parts = filePath.split('/')
    // Usually, the local system starts directly under the root '/', e.g., '/Users/name'
    if (parts.length > 1) {
      switch (parts[1]) {
        case 'Users':
        case 'Applications':
        case 'System':
        case 'Library':
          // This is the main system volume, which is generally named 'Macintosh HD' unless renamed
          return 'Macintosh HD'
        default:
          // You might want to add more cases as needed or handle it differently
          return null
      }
    }
  }

  return null // default return if none of the conditions are met
}

/*
const formatPath = (path: string): PathType => {
  const volumesPrefix = `/Volumes/${getVolumeName(path)}`

  return {
    volume: getVolumeName(path), // Volume name (e.g., root or drive letter)
    fullPath: path,
    relativePath: path.startsWith(volumesPrefix) ? path.slice(volumesPrefix.length) : path // Rest of the path after the volume
  }
}*/

export function formatCopiesFromString(copies: string[] | undefined): CopyType[] {
  if (!copies || copies.length === 0) return []

  return copies.map((copy) => ({
    volumes: [copy],
    clips: [],
    count: [0, 0]
  }))
}

/**
 * Takes an array of OcfClipType or SoundClipType and produces
 * an array of CopyType. (no grouping)
 */
export const formatCopiesFromClipsNOTGROUPED = (
  clips: (OcfClipType | SoundClipType)[] | undefined
): CopyType[] => {
  if (!clips || clips.length === 0) return []

  const total = clips.length
  const volumeMap = new Map<string, { copies: CopyBaseType[]; clips: Set<string> }>()

  // Build the volumeMap
  for (const clip of clips) {
    for (const copy of clip.copies) {
      const vol = copy.volume
      if (!volumeMap.has(vol)) {
        volumeMap.set(vol, { copies: [], clips: new Set() })
      }
      const entry = volumeMap.get(vol)!
      entry.copies.push(copy)
      entry.clips.add(clip.clip)
    }
  }

  // Return one group per volume
  return Array.from(volumeMap.values()).map(({ copies, clips }) => ({
    volumes: Array.from(new Set(copies.map((c) => c.volume))),
    clips: Array.from(clips),
    count: [clips.size, total]
  }))
}

/**
 * Takes an array of OcfClipType or SoundClipType and produces
 * an array of CopyType groups, grouping *by volume name*.
 */
export const formatCopiesFromClips = (
  clips: (OcfClipType | SoundClipType)[] | undefined
): CopyType[] => {
  if (!clips || clips.length === 0) return []

  // The total number of clips (used in the `count`)
  const total = clips.length

  /**
   * 1) Build a Map of `volume -> { copies: CopyBaseType[], clips: Set<string> }`
   *    so that we know which clip IDs reference this volume.
   *    ----------------------------------------------
   *    CHANGED from original "pathMap" to "volumeMap"
   */
  const volumeMap = new Map<
    string,
    {
      copies: CopyBaseType[]
      clips: Set<string>
    }
  >()

  for (const clip of clips) {
    for (const copy of clip.copies) {
      // CHANGED: use `copy.volume` instead of `copy.path`
      const vol = copy.volume

      if (!volumeMap.has(vol)) {
        volumeMap.set(vol, { copies: [], clips: new Set() })
      }

      const entry = volumeMap.get(vol)!
      entry.copies.push(copy)
      // Keep track of which clip IDs are on this volume
      entry.clips.add(clip.clip)
    }
  }

  /**
   * 2) Group the volumes if they have *no overlap* in their clip sets.
   *    Just like the original logic, but now the sets represent "volumes" instead of "paths."
   */
  const groups: Array<{
    copies: CopyBaseType[]
    clips: Set<string>
  }> = []

  // Same overlap check
  const hasOverlap = (setA: Set<string>, setB: Set<string>) => {
    for (const item of setA) {
      if (setB.has(item)) return true
    }
    return false
  }

  // Iterate over each volume's entry
  volumeMap.forEach(({ copies: volCopies, clips: volClips }, _) => {
    let addedToExistingGroup = false

    for (const group of groups) {
      // If there's no overlap in clip IDs, merge them
      if (!hasOverlap(group.clips, volClips)) {
        group.copies.push(...volCopies)
        volClips.forEach((c) => group.clips.add(c))
        addedToExistingGroup = true
        break
      }
    }

    // If not merged, create a new group
    if (!addedToExistingGroup) {
      groups.push({
        copies: [...volCopies],
        clips: new Set(volClips)
      })
    }
  })

  /**
   * 3) Finally, map each group to your final CopyType:
   *    { copies: ..., clips: ..., count: [uniqueClipsInGroup, totalClips] }
   */
  return groups.map((group) => {
    return {
      volumes: Array.from(new Set(group.copies.map((c) => c.volume))),
      clips: Array.from(group.clips),
      count: [group.clips.size, total]
    }
  })
}

/**
 * Similar to formatCopiesFromClips but takes in clips and returns copies(volumes) as string[]
 */
export const formatGroupedVolumes = (
  clips: (OcfClipType | SoundClipType)[] | undefined
): string[] => {
  if (!clips || clips.length === 0) return []

  // Build a map of volume -> set of clip IDs that reference it
  const volumeMap = new Map<string, Set<string>>()
  for (const clip of clips) {
    for (const copy of clip.copies) {
      const vol = copy.volume
      if (!volumeMap.has(vol)) {
        volumeMap.set(vol, new Set())
      }
      volumeMap.get(vol)!.add(clip.clip)
    }
  }

  // Helper: check for any overlap between two sets
  const hasOverlap = (setA: Set<string>, setB: Set<string>): boolean => {
    for (const item of setA) {
      if (setB.has(item)) return true
    }
    return false
  }

  // Group volumes where their clip sets do not overlap
  const groups: { volumes: string[]; clips: Set<string> }[] = []
  volumeMap.forEach((volClips, vol) => {
    let added = false
    for (const group of groups) {
      if (!hasOverlap(group.clips, volClips)) {
        group.volumes.push(vol)
        volClips.forEach((c) => group.clips.add(c))
        added = true
        break
      }
    }
    if (!added) {
      groups.push({ volumes: [vol], clips: new Set(volClips) })
    }
  })

  // For each group, merge the volume names into a string
  return groups.map((group) => group.volumes.join(' + '))
}

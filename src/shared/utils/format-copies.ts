import { OcfClipType, SoundClipType, CopyType, CopyBaseType } from '@shared/datalogTypes'
/*
function getVolumeName(filePath: string): string | null {
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

  const totalCount = copies.length

  return copies.map((copy) => ({
    copies: [
      {
        volume: copy,
        path: '',
        hash: null
      }
    ],
    clips: [],
    count: [totalCount, 0]
  }))
}

export const formatCopiesFromClips = (
  clips: (OcfClipType[] | SoundClipType[]) | undefined
): CopyType[] => {
  if (!clips || clips.length === 0) return []
  const total = clips.length

  // Map to associate each volume with its corresponding copies and clips
  const volMap = new Map<string, { copies: CopyBaseType[]; clips: Set<string> }>()

  // Populate the volMap with volumes, their copies, and associated clips
  clips.forEach((clip) => {
    clip.copies.forEach((copy) => {
      if (!volMap.has(copy.volume)) {
        volMap.set(copy.volume, { copies: [], clips: new Set() })
      }
      const volEntry = volMap.get(copy.volume)!
      volEntry.copies.push(copy)
      if (clip.clip) {
        volEntry.clips.add(clip.clip)
      }
    })
  })

  const groups: { copies: CopyBaseType[]; clips: Set<string> }[] = []

  // Helper function to determine if two sets have any overlapping elements
  const hasOverlap = (setA: Set<string>, setB: Set<string>): boolean => {
    for (const item of setA) {
      if (setB.has(item)) return true
    }
    return false
  }

  // Group volumes based on overlapping clips
  volMap.forEach(({ copies, clips }) => {
    let addedToGroup = false

    for (const group of groups) {
      if (!hasOverlap(group.clips, clips)) {
        group.copies.push(...copies)
        copies.forEach((copy) => {
          if (copy.hash) {
            group.clips.add(copy.hash)
          }
        })
        addedToGroup = true
        break
      }
    }

    if (!addedToGroup) {
      groups.push({
        copies: [...copies],
        clips: new Set(clips)
      })
    }
  })

  // Format the grouped data into the desired CopyType structure
  return groups.map((group) => ({
    copies: group.copies,
    clips: Array.from(group.clips),
    count: [group.clips.size, total]
  }))
}

/*
export const getCopiesFromClips = (clips: OcfClipType[] | SoundClipType[]): CopyType[] => {
  const total = clips.length

  const volMap = new Map<string, Set<string>>()

  clips.forEach((clip) => {
    clip.copies.forEach((copy) => {
      // If the path already exists, append the Clip to the array
      if (volMap.has(copy.volume)) {
        volMap.get(copy.volume)!.add(clip.clip)
      } else {
        // Otherwise, create a new entry with the current Clip
        volMap.set(copy.volume, new Set([clip.clip]))
      }
    })
  })

  const groups: { volume: string[]; clips: Set<string> }[] = []

  // Function to check if two sets overlap
  const hasOverlap = (setA: Set<string>, setB: Set<string>): boolean => {
    for (const item of setA) {
      if (setB.has(item)) return true
    }
    return false
  }

  // Iterate over each path in the pathMap
  volMap.forEach((clipsSet, vol) => {
    let addedToGroup = false

    // Try to add to an existing group
    for (const group of groups) {
      if (!hasOverlap(group.clips, clipsSet)) {
        group.copies.push(vol) // Add the path to this group
        clipsSet.forEach((clip) => group.clips.add(clip)) // Merge clips
        addedToGroup = true
        break
      }
    }

    // If no group found, create a new group
    if (!addedToGroup) {
      groups.push({ paths: [path], clips: new Set(clipsSet) })
    }
  })

  return groups.map((group) => ({
    copies: group.paths.map(formatPath),
    clips: [...group.clips],
    count: [group.clips.size, total]
  }))
}*/

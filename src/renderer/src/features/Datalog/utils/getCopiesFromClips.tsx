import { ClipType } from '@shared/datalogTypes'
import { CopyType, PathType } from '../builder/types'
import getVolumeName from './get-volume'

const formatPath = (path: string): PathType => {
  const volumesPrefix = `/Volumes/${getVolumeName(path)}`

  return {
    full: path, // Full path as is
    volume: getVolumeName(path), // Volume name (e.g., root or drive letter)
    relativePath: path.startsWith(volumesPrefix) ? path.slice(volumesPrefix.length) : path // Rest of the path after the volume
  }
}

export const getCopiesFromClips = (clips: ClipType[]): CopyType[] => {
  const total = clips.length

  const pathMap = new Map<string, Set<string>>()

  clips.forEach((clip) => {
    clip.copies.forEach((copy) => {
      // If the path already exists, append the Clip to the array
      if (pathMap.has(copy.path)) {
        pathMap.get(copy.path)!.add(clip.clip)
      } else {
        // Otherwise, create a new entry with the current Clip
        pathMap.set(copy.path, new Set([clip.clip]))
      }
    })
  })

  const groups: { paths: string[]; clips: Set<string> }[] = []

  // Function to check if two sets overlap
  const hasOverlap = (setA: Set<string>, setB: Set<string>): boolean => {
    for (const item of setA) {
      if (setB.has(item)) return true
    }
    return false
  }

  // Iterate over each path in the pathMap
  pathMap.forEach((clipsSet, path) => {
    let addedToGroup = false

    // Try to add to an existing group
    for (const group of groups) {
      if (!hasOverlap(group.clips, clipsSet)) {
        group.paths.push(path) // Add the path to this group
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
    paths: group.paths.map(formatPath),
    clips: [...group.clips],
    count: [group.clips.size, total]
  }))
}

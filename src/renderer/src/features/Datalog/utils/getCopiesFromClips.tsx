import { ClipType } from '@shared/datalogTypes'
import { CopyType, PathType } from '../types'
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

  /*const paths = Array.from(new Set(clips.flatMap((clip) => 
    clip.Copies.map((copy) => copy.Path)
  )))*/

  const pathMap = new Map<string, Set<string>>()

  clips.forEach((clip) => {
    clip.Copies.forEach((copy) => {
      // If the path already exists, append the Clip to the array
      if (pathMap.has(copy.Path)) {
        pathMap.get(copy.Path)!.add(clip.Clip)
      } else {
        // Otherwise, create a new entry with the current Clip
        pathMap.set(copy.Path, new Set([clip.Clip]))
      }
    })
  })

  const groups: { Paths: string[]; Clips: Set<string> }[] = []

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
      if (!hasOverlap(group.Clips, clipsSet)) {
        group.Paths.push(path) // Add the path to this group
        clipsSet.forEach((clip) => group.Clips.add(clip)) // Merge clips
        addedToGroup = true
        break
      }
    }

    // If no group found, create a new group
    if (!addedToGroup) {
      groups.push({ Paths: [path], Clips: new Set(clipsSet) })
    }
  })

  return groups.map((group) => ({
    paths: group.Paths.map(formatPath),
    clips: [...group.Clips],
    count: [group.Clips.size, total]
  }))
}

/*
  return groups.map((group) => {
    const formattedPath = group.Paths.map((p) => formatPath(p)) // Map over each path if it's an array
   // Format a single path

    return {
      paths: formattedPath,
      clips: Array.from(group.Clips),
      count: [group.Clips.size, total] // Convert Set back to an array for output
    }
  })*/

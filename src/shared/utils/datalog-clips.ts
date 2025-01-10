import { DatalogType } from '../datalogTypes'
import { timecodeToFrames, rangesOverlap } from './format-timecode'

// Example shape for the final merged result
export interface MergedProxy {
  size?: number
  format?: string
  codec?: string
  resolution?: string
}

export interface MergedClip {
  clip: string
  // OCF fields
  size?: number
  copies?: Array<{ volume: string; path: string; hash: string | null }>
  tc_start?: string
  tc_end?: string
  duration?: string
  camera_model?: string
  camera_id?: string
  reel?: string
  fps?: number
  sensor_fps?: string
  lens?: string
  resolution?: string
  codec?: string
  gamma?: string
  wb?: string
  tint?: string
  lut?: string

  // Merged Sound references
  sound?: string[] // the names of overlapping sound clips

  // Nested proxy object
  proxy?: MergedProxy

  // Additional fields from custom, appended at the top level
  [key: string]: unknown
}

/**
 * Main function: orchestrates merging of OCF, Proxy, Custom, and Sound clips
 * from a given DatalogType into an array of `MergedClip`.
 */
export function mergeClips(
  datalog: Pick<DatalogType, 'ocf' | 'sound' | 'proxy' | 'custom'>
): MergedClip[] {
  const clipMap = new Map<string, MergedClip>()

  // 1) Merge OCF
  mergeOcfClips(clipMap, datalog)
  // 2) Merge Proxy
  mergeProxyClips(clipMap, datalog)
  // 3) Merge Custom
  mergeCustomEntries(clipMap, datalog)
  // 4) Merge Sound (by timecode overlap)
  mergeSoundClips(clipMap, datalog)

  return Array.from(clipMap.values())
}

/* -----------------------------------------------------------
   1) Merge OCF
   - OCF clips define a "base" set of fields.
   - We can simply assign all OCF fields to the merged object.
----------------------------------------------------------- */
function mergeOcfClips(clipMap: Map<string, MergedClip>, datalog: Pick<DatalogType, 'ocf'>): void {
  const ocfClips = datalog.ocf?.clips || []

  mergeIntoMap(clipMap, ocfClips, (merged, ocfClip) => {
    // Copy all fields from ocfClip to merged in one go:
    Object.assign(merged, ocfClip)
  })
}

/* -----------------------------------------------------------
   2) Merge Proxy
   - For each Proxy clip, embed its relevant fields 
     under mergedClip.proxy = { ... }.
----------------------------------------------------------- */
function mergeProxyClips(
  clipMap: Map<string, MergedClip>,
  datalog: Pick<DatalogType, 'proxy'>
): void {
  const proxyClips = datalog.proxy?.clips || []

  mergeIntoMap(clipMap, proxyClips, (merged, proxyClip) => {
    merged.proxy = {
      size: proxyClip.size,
      format: proxyClip.format,
      codec: proxyClip.codec,
      resolution: proxyClip.resolution
    }
  })
}

/* -----------------------------------------------------------
   3) Merge Custom
   - Each "custom" item also has a `clip` field. We attach all 
     other fields on top-level of the merged clip object.
----------------------------------------------------------- */
function mergeCustomEntries(
  clipMap: Map<string, MergedClip>,
  datalog: Pick<DatalogType, 'custom'>
): void {
  const customEntries = datalog.custom || []

  mergeIntoMap(clipMap, customEntries, (merged, customObj) => {
    // Exclude the 'clip' property, then add everything else
    const { clip, ...rest } = customObj
    Object.assign(merged, rest)
  })
}

/* -----------------------------------------------------------
   4) Merge Sound
   - We do not merge by clip name, but by timecode overlap. 
   - Convert OCF start/end to frames, compare with Sound start/end frames,
     if they overlap, add sound clip name to `merged.sound`.
----------------------------------------------------------- */
function mergeSoundClips(
  clipMap: Map<string, MergedClip>,
  datalog: Pick<DatalogType, 'sound'>
): void {
  const soundClips = datalog.sound?.clips || []

  for (const [, mergedClip] of clipMap) {
    // If there's no OCF timecode or fps, skip
    if (!mergedClip.tc_start || !mergedClip.tc_end || !mergedClip.fps) {
      continue
    }

    const ocfStartFrames = timecodeToFrames(mergedClip.tc_start, mergedClip.fps)
    const ocfEndFrames = timecodeToFrames(mergedClip.tc_end, mergedClip.fps)

    // Find any soundClips that overlap
    for (const sClip of soundClips) {
      if (!sClip.tc_start || !sClip.tc_end || !sClip.fps) {
        continue
      }
      const soundStart = timecodeToFrames(sClip.tc_start, sClip.fps)
      const soundEnd = timecodeToFrames(sClip.tc_end, sClip.fps)

      if (rangesOverlap(ocfStartFrames, ocfEndFrames, soundStart, soundEnd)) {
        if (!mergedClip.sound) {
          mergedClip.sound = []
        }
        // Optionally avoid duplicates:
        if (!mergedClip.sound.includes(sClip.clip)) {
          mergedClip.sound.push(sClip.clip)
        }
      }
    }
  }
}

/* -----------------------------------
   Generic merge function:
   - Takes a list of items (which must have at least `clip`),
   - Finds or creates a MergedClip in `clipMap`,
   - Invokes the callback to do the actual field-by-field merge.
----------------------------------- */
function mergeIntoMap<T extends { clip: string }>(
  clipMap: Map<string, MergedClip>,
  items: T[],
  mergeCallback: (merged: MergedClip, item: T) => void
): void {
  for (const item of items) {
    const merged = getOrCreateClip(clipMap, item.clip)
    mergeCallback(merged, item)
  }
}

/* -----------------------------------
   Helper to retrieve or create a new
   MergedClip in the Map.
----------------------------------- */
function getOrCreateClip(clipMap: Map<string, MergedClip>, clipName: string): MergedClip {
  if (!clipMap.has(clipName)) {
    clipMap.set(clipName, { clip: clipName })
  }
  // Non-null assertion is safe because we just set it above
  return clipMap.get(clipName)!
}

import { OcfClipType, SoundClipType, ProxyClipType, CustomType } from '@shared/datalogTypes'
import { CameraMetadataZod } from '@shared/datalogTypes'
import { rangesOverlap, timecodeToSeconds } from '@shared/utils/format-timecode'
import z from 'zod'

type tupleString = { path: string; edit: boolean; value: string }
type tupleNumber = { path: string; edit: boolean; value: number }
type tupleArray = { path: string; edit: boolean; value: string[] }

export type valueTypes = tupleString | tupleNumber | tupleArray

export interface MergedClip {
  clip: tupleString
  size: tupleNumber
  tc_start: tupleString
  tc_end: tupleString
  duration: tupleString
  camera_model: tupleString
  camera_id: tupleString
  reel: tupleString
  fps: tupleNumber
  sensor_fps: tupleString
  lens: tupleString
  resolution: tupleString
  codec: tupleString
  gamma: tupleString
  wb: tupleString
  tint: tupleString
  lut: tupleString
  hash: tupleArray

  // Merged Sound references
  sound: tupleArray // the names of overlapping sound clips

  // proxy
  proxy_size: tupleNumber
  proxy_format: tupleString
  proxy_codec: tupleString
  proxy_resolution: tupleString

  // Additional fields from custom, appended at the top level
  [key: string]: valueTypes
}

export type OcfClipTypeExtended = OcfClipType & { id: string; index: number }
export type SoundClipTypeExtended = SoundClipType & { id: string; index: number }
export type ProxyClipTypeExtended = ProxyClipType & { id: string; index: number }
export type CustomClipTypeExtended = CustomType & { id: string; index: number }

export interface extendedClips {
  ocf: OcfClipTypeExtended[]
  sound: SoundClipTypeExtended[]
  proxy: ProxyClipTypeExtended[]
  custom: CustomClipTypeExtended[]
}
const OcfClipWithoutCopies = CameraMetadataZod.extend({ size: z.number() })
const ocfKeys = Object.keys(OcfClipWithoutCopies.shape)
console.log(ocfKeys)
const editNotAllowed = new Set([
  'clip',
  'tc_start',
  'tc_end',
  'sound',
  'duration',
  'size',
  'proxy_size'
])

function isPlainObject(val: any): val is object {
  return Object.prototype.toString.call(val) === '[object Object]'
}

export function createTableData(clips: extendedClips): MergedClip[] {
  console.time('createTableData')
  const clipMap = new Map<string, MergedClip>()
  if (!clips.ocf.length) return []

  // 1) Merge OCF
  mergeOcfClips(clipMap, clips.ocf)
  // 2) Merge Proxy
  mergeProxyClips(clipMap, clips.proxy)
  // 3) Merge Custom
  mergeCustomEntries(clipMap, clips.custom)
  // 4) Merge Sound (by timecode overlap)
  mergeSoundClips(clipMap, clips.sound)

  mergeDefaults(clipMap)

  console.timeEnd('createTableData')
  return Array.from(clipMap.values())
}

function mergeOcfClips(
  clipMap: Map<string, MergedClip>,
  ocfClips: OcfClipTypeExtended[] = []
): void {
  const maxCopies = ocfClips.reduce((max, clip) => {
    const count = Array.isArray(clip.copies) ? clip.copies.length : 0
    return Math.max(max, count)
  }, 0)

  mergeIntoMap(clipMap, ocfClips, (merged, ocfClip) => {
    ocfKeys.forEach((prop) => {
      merged[prop] = {
        path: `ocf.clips[${ocfClip.index}]`,
        edit: !editNotAllowed.has(prop),
        value: Object.prototype.hasOwnProperty.call(ocfClip, prop) ? ocfClip[prop] : ''
      }
    })

    // Process the "copies" property exclusively.
    if (!merged['hash']) {
      merged['hash'] = {
        path: `ocf.clips[${ocfClip.index}]`,
        edit: false,
        value: []
      }
    }

    for (let i = 0; i < maxCopies; i++) {
      if (Array.isArray(ocfClip.copies) && ocfClip.copies[i]) {
        const copy = ocfClip.copies[i]
        merged[`copy_${i + 1}`] = {
          path: `ocf.clips[${ocfClip.index}]`,
          edit: false,
          value: copy.volume
        }
        if (copy.hash) merged['hash'].value.push(copy.hash)
      } else {
        merged[`copy_${i + 1}`] = {
          path: `ocf.clips[${ocfClip.index}]`,
          edit: false,
          value: 'No Copy'
        }
      }
    }
  })
}

function mergeProxyClips(
  clipMap: Map<string, MergedClip>,
  proxyClips: ProxyClipTypeExtended[] = []
): void {
  const excludedProps = new Set(['index', 'id', 'clip'])
  mergeIntoMap(clipMap, proxyClips, (merged, proxyClip) => {
    Object.keys(proxyClip).forEach((prop) => {
      if (excludedProps.has(prop)) return
      merged[`proxy_${prop}`] = {
        path: `proxy.clips[${proxyClip.index}]`,
        edit: true,
        value: proxyClip[prop]
      }
    })
  })
}

function mergeSoundClips(
  clipMap: Map<string, MergedClip>,
  soundClips: SoundClipTypeExtended[] = []
): void {
  for (const [, mergedClip] of clipMap) {
    // If there's no OCF timecode or fps, skip
    if (!mergedClip.tc_start.value || !mergedClip.tc_end.value) {
      continue
    }

    const ocfStartFrames = timecodeToSeconds(mergedClip.tc_start.value)
    const ocfEndFrames = timecodeToSeconds(mergedClip.tc_end.value)

    // Find any soundClips that overlap
    for (const sClip of soundClips) {
      if (!sClip.tc_start || !sClip.tc_end) {
        continue
      }
      const soundStart = timecodeToSeconds(sClip.tc_start)
      const soundEnd = timecodeToSeconds(sClip.tc_end)

      if (rangesOverlap(ocfStartFrames, ocfEndFrames, soundStart, soundEnd)) {
        if (!mergedClip.sound) {
          mergedClip.sound = { path: `sound.clips[${sClip.index}]`, edit: false, value: [] }
        }
        // Optionally avoid duplicates:
        if (!mergedClip.sound.value.includes(sClip.clip)) {
          mergedClip.sound.value.push(sClip.clip)
        }
      }
    }
  }
}

function mergeCustomEntries(
  clipMap: Map<string, MergedClip>,
  customClips: CustomClipTypeExtended[] = []
): void {
  const excludedProps = new Set(['index', 'id', 'clip'])
  mergeIntoMap(clipMap, customClips, (merged, customClip) => {
    Object.keys(customClip).forEach((prop) => {
      if (excludedProps.has(prop)) return
      const value = customClip[prop]
      const basePath = `custom[${customClip.index}]${typeof value === 'object' && value !== null ? `.${prop}` : ''}`

      if (Array.isArray(value)) {
        const processedArray = value
          .map((item) => (isPlainObject(item) ? JSON.stringify(item) : item))
          .join(', ')
        merged[prop] = {
          path: `custom[${customClip.index}]`,
          edit: false,
          value: processedArray
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach((nestedKey) => {
          merged[`${prop}_${nestedKey}`] = {
            path: `${basePath}.${nestedKey}`,
            edit: false,
            value: value[nestedKey]
          }
        })
      } else {
        merged[prop] = {
          path: `custom[${customClip.index}]`,
          edit: false,
          value: value
        }
      }
    })
  })
}

function mergeDefaults(clipMap: Map<string, MergedClip>): void {
  const allKeys = new Set<string>()
  clipMap.forEach((mergedClip) => {
    Object.keys(mergedClip).forEach((key) => allKeys.add(key))
  })

  // Add missing keys with defaults for each MergedClip.
  clipMap.forEach((mergedClip) => {
    allKeys.forEach((key) => {
      if (!(key in mergedClip)) {
        // Adjust default value for specific keys as needed.
        mergedClip[key] = {
          path: '',
          edit: false,
          value: ''
        }
      }
    })
  })
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
    clipMap.set(clipName, {} as MergedClip)
  }
  // Non-null assertion is safe because we just set it above
  return clipMap.get(clipName)!
}

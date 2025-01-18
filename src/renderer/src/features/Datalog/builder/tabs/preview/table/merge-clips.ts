import { OcfClipType, SoundClipType, ProxyClipType, CustomType } from '@shared/datalogTypes'

type type = 'ocf' | 'sound' | 'proxy' | 'custom'

export interface MergedClip {
  clip: string

  size: [type, number, number]
  //copies?: Array<{ volume: string; path: string; hash: string | null }>
  tc_start: [type, number, string]
  tc_end: [type, number, string]
  duration: [type, number, string]
  camera_model: [type, number, string]
  camera_id: [type, number, string]
  reel: [type, number, string]
  fps: [type, number, string]
  sensor_fps: [type, number, string]
  lens: [type, number, string]
  resolution: [type, number, string]
  codec: [type, number, string]
  gamma: [type, number, string]
  wb: [type, number, string]
  tint: [type, number, string]
  lut: [type, number, string]
  hash: string[]

  // Merged Sound references
  sound: string[] // the names of overlapping sound clips

  // proxy
  proxy_size: [type, number, number]
  proxy_format: [type, number, string]
  proxy_codec: [type, number, string]
  proxy_resolution: [type, number, string]

  // Additional fields from custom, appended at the top level
  [key: string]: unknown
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

const editNotAllowed = new Set(['clip', 'tc_start', 'tc_end', 'sound', 'duration'])

export function mergeClips(clips: extendedClips): MergedClip[] {
  const clipMap = new Map<string, MergedClip>()

  // 1) Merge OCF
  mergeOcfClips(clipMap, clips.ocf)
  // 2) Merge Proxy
  mergeProxyClips(clipMap, clips.proxy)
  // 3) Merge Custom
  mergeCustomEntries(clipMap, clips.custom)
  // 4) Merge Sound (by timecode overlap)
  //mergeSoundClips(clipMap, datalog)

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
  const excludedProps = new Set(['index', 'id', 'copies'])
  mergeIntoMap(clipMap, ocfClips, (merged, ocfClip) => {
    Object.keys(ocfClip).forEach((prop) => {
      if (excludedProps.has(prop)) return
      merged[prop] = ['ocf', ocfClip.index, !editNotAllowed.has(prop), ocfClip[prop]]
    })
    // Process the "copies" property exclusively.
    if (!merged['hash']) {
      merged['hash'] = []
    }

    for (let i = 0; i < maxCopies; i++) {
      if (Array.isArray(ocfClip.copies) && ocfClip.copies[i]) {
        const copy = ocfClip.copies[i]
        merged[`copy_${i + 1}`] = ['ocf', ocfClip.index, false, copy.volume]
        if (copy.hash) merged['hash'].push(copy.hash)
      } else {
        merged[`copy_${i + 1}`] = ['ocf', ocfClip.index, false, 'No Copy']
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
      merged[`proxy_${prop}`] = ['proxy', proxyClip.index, true, proxyClip[prop]]
    })
  })
}

function mergeCustomEntries(
  clipMap: Map<string, MergedClip>,
  customClips: CustomClipTypeExtended[] = []
): void {
  const excludedProps = new Set(['index', 'id', 'clip'])
  mergeIntoMap(clipMap, customClips, (merged, customClip) => {
    Object.keys(customClip).forEach((prop) => {
      if (excludedProps.has(prop)) return
      merged[prop] = ['custom', customClip.index, !editNotAllowed.has(prop), customClip[prop]]
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
    clipMap.set(clipName, { clip: clipName } as MergedClip)
  }
  // Non-null assertion is safe because we just set it above
  return clipMap.get(clipName)!
}

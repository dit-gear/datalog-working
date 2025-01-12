import { getReels as getReelsFunction, getReelsOptions } from './format-reel'
import { formatBytes, FormatBytesOptions, FormatBytesTypes, FormatOutput } from './format-bytes'
import { formatDuration } from './format-duration'
import {
  DatalogType,
  OcfClipType,
  OcfType,
  ProxyType,
  ProxyClipType,
  SoundClipType,
  SoundType,
  CopyType
} from '@shared/datalogTypes'
import {
  timecodeToFrames,
  framesToTimecode,
  timecodeToSeconds,
  secondsToLargeTimecode
} from './format-timecode'
import { ProjectRootType } from '@shared/projectTypes'
import { durationType } from '@shared/shared-types'
import { formatCopiesFromString, formatCopiesFromClips } from './format-copies'
import { Datalog } from '@shared/datalogClass'

type Clip = OcfClipType | ProxyClipType | SoundClipType

/**
 * Utility to count how many “files” from an array of clips
 * (Sometimes you might interpret “files” simply as the count of those clips.)
 */
function countClipFiles(clips: Clip[] | undefined): number {
  return clips?.length ?? 0
}

/**
 * Utility to sum the numeric `size` of an array of clips
 */
function sumClipSizes(clips: Clip[] | undefined): number {
  if (!clips) return 0
  return clips.reduce((acc, clip) => acc + (clip.size ?? 0), 0)
}

/**
 * Utility to sum timecode durations from an array of OCF clips.
 * converts each clip’s `duration` to frames, sums up, then converts back.
 */
function sumClipDurations(clips: OcfClipType[] | undefined, fallbackFps = 24): string {
  if (!clips || clips.length === 0) {
    return '00:00:00:00'
  }
  const totalFrames = clips.reduce((acc, clip) => {
    // If clip.fps is missing, fall back to some default
    const fps = clip.fps ?? fallbackFps
    return acc + (clip.duration ? timecodeToFrames(clip.duration, fps) : 0)
  }, 0)

  // For simplicity, assume we just use the first clip’s fps
  const fps = clips[0]?.fps ?? fallbackFps
  return framesToTimecode(totalFrames, fps)
}

export const getFiles = (
  data: Pick<OcfType | ProxyType | SoundType, 'files' | 'clips'>
): number => {
  return data?.files != null ? data.files : countClipFiles(data.clips)
}

export function getSize(data: Pick<OcfType | ProxyType | SoundType, 'size' | 'clips'>): number
export function getSize<T extends FormatOutput>(
  data: Pick<OcfType | ProxyType | SoundType, 'size' | 'clips'>,
  options: FormatBytesOptions<T>
): T extends 'tuple' ? [number, string] : T extends 'number' ? number : string
export function getSize<T extends FormatOutput>(
  data: Pick<OcfType | ProxyType | SoundType, 'size' | 'clips'>,
  options?: FormatBytesOptions<T>
): number | string | [number, string] {
  const size = data?.size != null ? data.size : sumClipSizes(data.clips)
  return options ? formatBytes(size, options) : size
}

export function getDuration(data: Pick<OcfType, 'duration' | 'clips'>, format: 'tc'): string
export function getDuration(data: Pick<OcfType, 'duration' | 'clips'>, format: 'seconds'): number
export function getDuration(data: Pick<OcfType, 'duration' | 'clips'>, format: 'hms'): durationType
export function getDuration(data: Pick<OcfType, 'duration' | 'clips'>, format: 'hms-string'): string
export function getDuration(
  data: Pick<OcfType, 'duration' | 'clips'>,
  format: 'tc' | 'seconds' | 'hms' | 'hms-string'
): string | number | durationType {
  const duration = data?.duration ?? sumClipDurations(data.clips)
  if (format === 'seconds') return timecodeToSeconds(duration)
  if (format === 'hms') return formatDuration(duration)
  if (format === 'hms-string') return formatDuration(duration, { asString: true })
  return duration
}

export const getReels = (
  data: Pick<OcfType, 'reels' | 'clips'>,
  options?: getReelsOptions
): string[] => {
  if (data.reels !== undefined) {
    return getReelsFunction(data.reels, options)
  } else if (data.clips && data.clips.length > 0) {
    return getReelsFunction(data.clips, options)
  } else return []
}

export function getCopies(data: Pick<OcfType | SoundType, 'copies' | 'clips'>): CopyType[] {
  return data.copies ? formatCopiesFromString(data.copies) : formatCopiesFromClips(data.clips)
}

type Context = 'ocf' | 'proxy' | 'sound'

export function getTotalFiles(data: Datalog[], context: Context): number {
  const contextMap: Record<Context, keyof Datalog> = {
    ocf: 'ocf',
    proxy: 'proxy',
    sound: 'sound'
  }

  const files = data.reduce((sum, log) => {
    const ctx = log[contextMap[context]]
    if (typeof ctx === 'object' && ctx !== null && 'files' in ctx) {
      return sum + ctx.files()
    }
    return sum
  }, 0)

  return files
}

export function getTotalSize(data: Datalog[], context: Context): number
export function getTotalSize<T extends FormatOutput>(
  data: Datalog[],
  context: Context,
  options: FormatBytesOptions<T>
): T extends 'tuple' ? [number, string] : T extends 'number' ? number : string
export function getTotalSize<T extends FormatOutput>(
  data: Datalog[],
  context: Context,
  options?: FormatBytesOptions<T>
): number | string | [number, string] {
  const contextMap: Record<Context, keyof Datalog> = {
    ocf: 'ocf',
    proxy: 'proxy',
    sound: 'sound'
  }

  const size = data.reduce((sum, log) => {
    const ctx = log[contextMap[context]]
    if (typeof ctx === 'object' && ctx !== null && 'sizeAsNumber' in ctx) {
      return sum + ctx.sizeAsNumber()
    }
    return sum
  }, 0)

  return options ? formatBytes(size, options) : size
}

export function getTotalDuration(data: Datalog[], format: 'tc'): string
export function getTotalDuration(data: Datalog[], format: 'hms-string'): string
export function getTotalDuration(data: Datalog[], format: 'hms'): durationType
export function getTotalDuration(
  data: Datalog[],
  format: 'tc' | 'hms' | 'hms-string'
): string | durationType {
  const duration = data.reduce((sum, log) => sum + log.ocf.durationAsSeconds(), 0)
  const durationTC = secondsToLargeTimecode(duration)
  if (format === 'hms') return formatDuration(durationTC)
  if (format === 'hms-string') return formatDuration(durationTC, { asString: true })
  return durationTC
}

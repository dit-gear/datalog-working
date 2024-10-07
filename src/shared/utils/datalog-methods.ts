import { getReels as getReelsFunction, getReelsOptions } from './format-reel'
import { formatBytes } from './format-bytes'
import { formatDuration, FormatDurationOptions } from './format-duration'
import { DatalogType } from '@shared/datalogTypes'

export const getOCFFiles = (data: DatalogType): number => {
  const files = data.OCF?.Files ?? data.Clips?.length ?? 0
  return files
}
export const getOCFSize = (data: DatalogType): string => {
  const size = data.OCF?.Size ?? data.Clips?.reduce((acc, clip) => acc + (clip.Size ?? 0), 0) ?? 0
  return formatBytes(size)
}
export const getProxyFiles = (data: DatalogType): number => {
  const files =
    data.Proxy?.Files ?? data.Clips?.filter((clip) => clip.Proxy !== undefined).length ?? 0
  return files
}

export const getProxySize = (data: DatalogType): string => {
  const size =
    data.Proxy?.Size ?? data.Clips?.reduce((acc, clip) => acc + (clip.Proxy?.Size ?? 0), 0) ?? 0
  return size > 0 ? formatBytes(size) : ''
}

export const getDuration = (data: DatalogType, options?: FormatDurationOptions): string => {
  const duration =
    data.Duration ?? data.Clips?.reduce((acc, clip) => acc + (clip.Duration ?? 0), 0) ?? 0
  return duration > 0 ? formatDuration(duration, { ...options, asString: true }) : ''
}

export const getReels = (data: DatalogType, options?: getReelsOptions): string[] => {
  if (data.Reels !== undefined) {
    return getReelsFunction(data.Reels, options)
  } else if (data.Clips && data.Clips.length > 0) {
    return getReelsFunction(data.Clips, options)
  } else return []
}

export class Datalog {
  public readonly data: DatalogType // set to private to not expose

  constructor(data: DatalogType) {
    this.data = data
  }
  public ocf = {
    getFilesCount: () => getOCFFiles(this.data),
    getSize: () => getOCFSize(this.data)
  }
  public proxys = {
    getFilesCount: () => getProxyFiles(this.data),
    getSize: () => getProxySize(this.data)
  }

  getDuration() {
    return getDuration(this.data)
  }
  getReels(options?: getReelsOptions) {
    return getReels(this.data, options)
  }
}

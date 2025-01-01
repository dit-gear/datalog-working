import { getReels as getReelsFunction, getReelsOptions } from './format-reel'
import { formatBytes } from './format-bytes'
import { formatDuration, FormatDurationOptions } from './format-duration'
import { DatalogType } from '@shared/datalogTypes'
import { ProjectRootType } from '@shared/projectTypes'

export const getOCFFiles = (data: DatalogType): number => {
  const files = data.ocf?.files ?? data.clips?.length ?? 0
  return files
}

export function getOCFSize(data: DatalogType, options?: { format: true }): string
export function getOCFSize(data: DatalogType, options?: { format: false }): number
export function getOCFSize(
  data: DatalogType,
  options: { format: true } | { format: false } = { format: true }
): string | number {
  const size = data.ocf?.size ?? data.clips?.reduce((acc, clip) => acc + (clip.size ?? 0), 0) ?? 0
  return options.format ? formatBytes(size) : size
}
export const getProxyFiles = (data: DatalogType): number => {
  const files =
    data.proxy?.files ?? data.clips?.filter((clip) => clip.proxy !== undefined).length ?? 0
  return files
}

export const getProxySize = (data: DatalogType): string => {
  const size =
    data.proxy?.size ?? data.clips?.reduce((acc, clip) => acc + (clip.proxy?.size ?? 0), 0) ?? 0
  return size > 0 ? formatBytes(size) : ''
}

export const getDuration = (data: DatalogType, options?: FormatDurationOptions): string => {
  const duration =
    data.duration ?? data.clips?.reduce((acc, clip) => acc + (clip.duration ?? 0), 0) ?? 0
  return duration > 0 ? formatDuration(duration, { ...options, asString: true }) : ''
}

export const getReels = (data: DatalogType, options?: getReelsOptions): string[] => {
  if (data.reels !== undefined) {
    return getReelsFunction(data.reels, options)
  } else if (data.clips && data.clips.length > 0) {
    return getReelsFunction(data.clips, options)
  } else return []
}

function mergeDatalogs(datalogs: DatalogType[]): DatalogType {
  // Initialize an empty DatalogType object
  const mergedDatalog: DatalogType = {
    id: '',
    date: '',
    day: 0,
    ocf: { size: 0, files: 0 },
    proxy: { size: 0, files: 0 },
    duration: 0,
    clips: [],
    reels: []
  }

  if (datalogs.length === 0) {
    return mergedDatalog
  }

  // Merge Dates
  const dates = datalogs.map((d) => d.date)
  const minDate = dates.reduce((a, b) => (a < b ? a : b))
  const maxDate = dates.reduce((a, b) => (a > b ? a : b))
  mergedDatalog.date = minDate === maxDate ? minDate : `${minDate} - ${maxDate}`

  // Merge Days
  const days = datalogs.map((d) => d.day)
  const minDay = Math.min(...days)
  const maxDay = Math.max(...days)
  //mergedDatalog.Day = minDay === maxDay ? minDay : `${minDay} - ${maxDay}`
  mergedDatalog.day = minDay

  // Merge OCF
  mergedDatalog.ocf = {
    size: datalogs.reduce((acc, d) => acc + (d.ocf?.size ?? 0), 0),
    files: datalogs.reduce((acc, d) => acc + (d.ocf?.files ?? 0), 0)
  }

  // Merge Proxy
  mergedDatalog.proxy = {
    size: datalogs.reduce((acc, d) => acc + (d.proxy?.size ?? 0), 0),
    files: datalogs.reduce((acc, d) => acc + (d.proxy?.files ?? 0), 0)
  }

  // Merge Duration
  mergedDatalog.duration = datalogs.reduce((acc, d) => acc + (d.duration ?? 0), 0)

  // Merge Clips
  mergedDatalog.clips = datalogs.flatMap((d) => d.clips ?? [])

  // Merge Reels
  const reelsSet = new Set<string>()
  datalogs.forEach((d) => {
    const reels = d.reels ?? []
    reels.forEach((reel) => reelsSet.add(reel))
  })
  mergedDatalog.reels = Array.from(reelsSet)

  // Merge other fields as necessary

  return mergedDatalog
}

export class Datalog {
  public readonly raw: DatalogType

  constructor(data: DatalogType) {
    this.raw = data
  }
  public get logName(): string {
    return this.raw.id
  }
  public get day(): number {
    return this.raw.day
  }
  public get date(): string {
    return this.raw.date
  }
  public get clips() {
    return this.raw.clips
  }
  public ocf = {
    getFilesCount: () => getOCFFiles(this.raw),
    getSize: () => getOCFSize(this.raw),
    getCopies: () => 'TODO: list copies here'
  }
  public proxys = {
    getFilesCount: () => getProxyFiles(this.raw),
    getSize: () => getProxySize(this.raw)
  }

  getDuration() {
    return getDuration(this.raw)
  }
  getReels(options?: getReelsOptions) {
    return getReels(this.raw, options)
  }
}

export class DataObject {
  private project: ProjectRootType
  private datalogOne: Datalog
  private datalogMulti: Datalog[]
  private all: Datalog[] // fix later

  constructor(
    project: ProjectRootType,
    datalog_selection: DatalogType | DatalogType[],
    datalog_all: DatalogType[]
  ) {
    const selection = datalog_selection
    const all = datalog_all

    if (!project) {
      throw new Error('Project is required to initialize DataObject.')
    }

    if (!all || all.length === 0) {
      throw new Error("The 'all' array must contain at least one DatalogType.")
    }

    if (!selection || (Array.isArray(selection) && selection.length === 0)) {
      throw new Error('The selection is empty')
    }

    this.project = project
    //this.selection = selection
    this.all = all.map((data) => new Datalog(data))

    if (Array.isArray(selection)) {
      // Merge the selected datalogs
      const mergedData = mergeDatalogs(selection)
      this.datalogOne = new Datalog(mergedData)
      this.datalogMulti = selection.map((data) => new Datalog(data))
    } else {
      this.datalogOne = new Datalog(selection)
      this.datalogMulti = [new Datalog(selection)]
    }
  }

  // Getter for the project name
  get projectName(): string {
    return this.project.project_name
  }

  // Getter for the selected datalog (merged if multiple)
  get datalog(): Datalog {
    return this.datalogOne
  }

  // Getter for the selected datalogs array
  get datalogArray(): Datalog[] {
    return this.datalogMulti
  }

  // Getter for all datalogs
  get datalogs(): Datalog[] {
    return this.all
  }

  get totals() {
    return {
      getTotalOCFSize: (): string => {
        const totalSize = this.all.reduce(
          (acc, datalog) => acc + (getOCFSize(datalog.raw, { format: false }) as number),
          0
        )
        return totalSize > 0 ? formatBytes(totalSize) : '0 bytes'
      },
      getTotalOCFFileCount: (): number => {
        return this.all.reduce((acc, datalog) => acc + getOCFFiles(datalog.raw), 0)
      }
    }
  }
  /*
  public totals = {
    getTotalOCFSize(): string {
      const totalSize = this.all.reduce(
        (acc, datalog) => acc + (getOCFSize(datalog.raw, { format: false }) as number), // Using getOCFSize from utils
        0
      )
      return totalSize > 0 ? formatBytes(totalSize) : '0 bytes' // Format size for readability
    },
  
    // Method to get the total OCF file count of "all" datalogs
    getTotalOCFFileCount(): number {
      return this.all.reduce(
        (acc, datalog) => acc + getOCFFiles(datalog.raw), // Using getOCFFiles from utils
        0
      )
    }

  }*/
}

import { getReels as getReelsFunction, getReelsOptions } from './format-reel'
import { formatBytes } from './format-bytes'
import { formatDuration, FormatDurationOptions } from './format-duration'
import { DatalogType } from '@shared/datalogTypes'
import { ProjectRootType } from '@shared/projectTypes'

export const getOCFFiles = (data: DatalogType): number => {
  const files = data.OCF?.Files ?? data.Clips?.length ?? 0
  return files
}

export function getOCFSize(data: DatalogType, options?: { format: true }): string
export function getOCFSize(data: DatalogType, options?: { format: false }): number
export function getOCFSize(
  data: DatalogType,
  options: { format: true } | { format: false } = { format: true }
): string | number {
  const size = data.OCF?.Size ?? data.Clips?.reduce((acc, clip) => acc + (clip.Size ?? 0), 0) ?? 0
  return options.format ? formatBytes(size) : size
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

function mergeDatalogs(datalogs: DatalogType[]): DatalogType {
  // Initialize an empty DatalogType object
  const mergedDatalog: DatalogType = {
    Folder: '',
    Date: '',
    Day: 0,
    OCF: { Size: 0, Files: 0 },
    Proxy: { Size: 0, Files: 0 },
    Duration: 0,
    Clips: [],
    Reels: []
    // Add other necessary fields based on your DatalogType definition
  }

  if (datalogs.length === 0) {
    return mergedDatalog
  }

  // Merge Dates
  const dates = datalogs.map((d) => d.Date)
  const minDate = dates.reduce((a, b) => (a < b ? a : b))
  const maxDate = dates.reduce((a, b) => (a > b ? a : b))
  mergedDatalog.Date = minDate === maxDate ? minDate : `${minDate} - ${maxDate}`

  // Merge Days
  const days = datalogs.map((d) => d.Day)
  const minDay = Math.min(...days)
  const maxDay = Math.max(...days)
  //mergedDatalog.Day = minDay === maxDay ? minDay : `${minDay} - ${maxDay}`
  mergedDatalog.Day = minDay

  // Merge OCF
  mergedDatalog.OCF = {
    Size: datalogs.reduce((acc, d) => acc + (d.OCF?.Size ?? 0), 0),
    Files: datalogs.reduce((acc, d) => acc + (d.OCF?.Files ?? 0), 0)
  }

  // Merge Proxy
  mergedDatalog.Proxy = {
    Size: datalogs.reduce((acc, d) => acc + (d.Proxy?.Size ?? 0), 0),
    Files: datalogs.reduce((acc, d) => acc + (d.Proxy?.Files ?? 0), 0)
  }

  // Merge Duration
  mergedDatalog.Duration = datalogs.reduce((acc, d) => acc + (d.Duration ?? 0), 0)

  // Merge Clips
  mergedDatalog.Clips = datalogs.flatMap((d) => d.Clips ?? [])

  // Merge Reels
  const reelsSet = new Set<string>()
  datalogs.forEach((d) => {
    const reels = d.Reels ?? []
    reels.forEach((reel) => reelsSet.add(reel))
  })
  mergedDatalog.Reels = Array.from(reelsSet)

  // Merge other fields as necessary

  return mergedDatalog
}

export class Datalog {
  public readonly raw: DatalogType

  constructor(data: DatalogType) {
    this.raw = data
  }
  public get logName(): string {
    return this.raw.Folder
  }
  public get day(): number {
    return this.raw.Day
  }
  public get date(): string {
    return this.raw.Date
  }
  public get clips() {
    return this.raw.Clips
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
  //private selection: DatalogType | DatalogType[]
  private datalogOne: Datalog
  private datalogArray: Datalog[]
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
      this.datalogArray = selection.map((data) => new Datalog(data))
    } else {
      this.datalogOne = new Datalog(selection)
      this.datalogArray = [new Datalog(selection)]
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
  get datalogs(): Datalog[] {
    return this.datalogArray
  }

  // Getter for all datalogs
  get allDatalogs(): Datalog[] {
    return this.all
  }

  getTotalOCFSize(): string {
    const totalSize = this.all.reduce(
      (acc, datalog) => acc + (getOCFSize(datalog.raw, { format: false }) as number), // Using getOCFSize from utils
      0
    )
    return totalSize > 0 ? formatBytes(totalSize) : '0 bytes' // Format size for readability
  }

  // Method to get the total OCF file count of "all" datalogs
  getTotalOCFFileCount(): number {
    return this.all.reduce(
      (acc, datalog) => acc + getOCFFiles(datalog.raw), // Using getOCFFiles from utils
      0
    )
  }
}

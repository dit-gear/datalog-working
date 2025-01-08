import { mergeClips } from './utils/datalog-clips'
import { DatalogType, CopyType } from './datalogTypes'
import { ProjectRootType } from './projectTypes'
import { durationType } from '@shared/shared-types'
import { getReelsOptions } from './utils/format-reel'
import { mergeDatalogs } from './utils/datalog-merge'
import {
  getReels,
  getFiles,
  getSize,
  getDuration,
  getCopies,
  getTotalSize,
  getTotalDuration
} from './utils/datalog-methods'

export class Datalog {
  public readonly clips: any[]
  private raw: DatalogType

  constructor(data: DatalogType) {
    this.clips = mergeClips(data)
    this.raw = data
  }
  public get id(): string {
    return this.raw.id
  }
  public get day(): string {
    return this.raw.day.toString()
  }

  public get date(): string {
    return this.raw.date
  }
  public get ocf() {
    const ocfData = this.raw.ocf

    return {
      clips: ocfData.clips,
      files: (): number => getFiles(ocfData),
      size: (): string => getSize(ocfData, { format: true }),
      sizeAsNumber: (): number => getSize(ocfData, { format: false }),
      copies: (): CopyType[] => getCopies(ocfData),
      reels: (options?: getReelsOptions): string[] => getReels(ocfData, options),
      duration: (): string => getDuration(ocfData, 'tc'),
      durationReadable: (): string => getDuration(ocfData, 'hms-string'),
      durationObject: (): durationType => getDuration(ocfData, 'hms'),
      durationAsSeconds: (): number => getDuration(ocfData, 'seconds')
    }
  }
  public get proxy() {
    const proxyData = this.raw.proxy

    return {
      files: (): number => getFiles(proxyData),
      size: (): string => getSize(proxyData, { format: true }),
      sizeAsNumber: (): number => getSize(proxyData, { format: false })
    }
  }

  public get sound() {
    const soundData = this.raw.sound

    return {
      clips: soundData.clips,
      files: (): number => getFiles(soundData),
      size: (): string => getSize(soundData, { format: true }),
      sizeAsNumber: (): number => getSize(soundData, { format: false }),
      copies: (): CopyType[] => getCopies(soundData)
    }
  }
}

export class DataObject {
  private project: ProjectRootType
  private datalogOne: Datalog
  private datalogMulti: Datalog[]
  private all: Datalog[]

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
  public get projectName(): string {
    return this.project.project_name
  }

  // Getter for the selected datalog (merged if multiple)
  public get datalog(): Datalog {
    return this.datalogOne
  }

  // Getter for the selected datalogs array
  public get datalogArray(): Datalog[] {
    return this.datalogMulti
  }

  // Getter for all datalogs
  public get datalogs(): Datalog[] {
    return this.all
  }

  public get total() {
    const all = this.all

    const ocf = {
      size: (): string => getTotalSize(all, 'ocf', { format: true }),
      sizeAsNumber: (): number => getTotalSize(all, 'ocf', { format: false }),
      duration: (): string => getTotalDuration(all, 'tc'),
      durationReadable: (): string => getTotalDuration(all, 'hms-string'),
      durationObject: (): durationType => getTotalDuration(all, 'hms')
    }
    const proxy = {
      size: (): string => getTotalSize(all, 'proxy', { format: true }),
      sizeAsNumber: (): number => getTotalSize(all, 'proxy', { format: false })
    }

    const sound = {
      size: (): string => getTotalSize(all, 'sound', { format: true }),
      sizeAsNumber: (): number => getTotalSize(all, 'sound', { format: false })
    }

    return {
      days: (): number => all.length,
      ocf,
      proxy,
      sound
    }
  }
}

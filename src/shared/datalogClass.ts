import { mergeClips, MergedClip, MergedProxy } from './utils/datalog-clips'
import {
  DatalogType,
  CopyType,
  OcfType,
  SoundType,
  ProxyType,
  DatalogTypeMerged,
  DatalogDynamicType
} from './datalogTypes'
import { ProjectRootType } from './projectTypes'
import { DurationType } from '@shared/shared-types'
import { ReelsOptions } from './utils/format-reel'
import { FormatBytesTypes, formatBytes } from './utils/format-bytes'
import { mergeDatalogs } from './utils/datalog-merge'
import {
  getReels,
  getFiles,
  getSize,
  getDuration,
  getCopies,
  getTotalSize,
  getTotalDuration,
  getTotalFiles,
  getDurationFormatted,
  getTotalDateRange
} from './utils/datalog-methods'

class Clip implements Omit<MergedClip, 'size' | 'duration'> {
  public clip!: string
  public copies?: Array<{ volume: string; hash: string | null }>
  public tc_start?: string
  public tc_end?: string
  public camera_model?: string
  public camera_id?: string
  public reel?: string
  public fps?: number
  public sensor_fps?: string
  public lens?: string
  public resolution?: string
  public codec?: string
  public gamma?: string
  public wb?: string
  public tint?: string
  public lut?: string
  public sound?: string[];
  [key: string]: unknown

  private _rawSize?: number
  private _rawDuration?: string
  private _rawProxy?: MergedProxy

  // Copy all properties from the merged clip directly onto the instance
  constructor(data: MergedClip) {
    const { size, duration, proxy, ...rest } = data
    Object.assign(this, rest)
    this._rawSize = size
    this._rawDuration = duration
    this._rawProxy = proxy
  }

  size(options?: { type: FormatBytesTypes }): string {
    return formatBytes(this._rawSize ?? 0, { output: 'string', type: options?.type })
  }
  sizeAsNumber(options?: { type: FormatBytesTypes }): number {
    return formatBytes(this._rawSize ?? 0, { output: 'number', type: options?.type })
  }
  sizeAsTuple(options?: { type: FormatBytesTypes }): [number, string] {
    return formatBytes(this._rawSize ?? 0, { output: 'tuple', type: options?.type })
  }
  duration(): string {
    return getDurationFormatted(this._rawDuration, 'hms-string')
  }
  durationTC(): string {
    return getDurationFormatted(this._rawDuration, 'tc')
  }
  durationObject(): DurationType {
    return getDurationFormatted(this._rawDuration, 'hms')
  }
  durationAsSeconds(): number {
    return getDurationFormatted(this._rawDuration, 'seconds')
  }
  durationAsFrames(): number {
    return getDurationFormatted(this._rawDuration, 'frames', this.fps)
  }
  public get proxy() {
    // If _rawProxy is missing or its size isn't a number, default to 0
    const rawSize =
      this._rawProxy && typeof this._rawProxy.size === 'number' ? this._rawProxy.size : 0
    return {
      ...this._rawProxy,
      size(options?: { type: FormatBytesTypes }): string {
        return formatBytes(rawSize ?? 0, { output: 'string', type: options?.type })
      },
      sizeAsNumber(options?: { type: FormatBytesTypes }): number {
        return formatBytes(rawSize ?? 0, { output: 'number', type: options?.type })
      },
      sizeAsTuple(options?: { type: FormatBytesTypes }): [number, string] {
        return formatBytes(rawSize ?? 0, { output: 'tuple', type: options?.type })
      }
    }
  }
}

export class Datalog {
  public readonly clips: Clip[]
  private raw: DatalogType | DatalogTypeMerged

  constructor(data: DatalogType | DatalogTypeMerged) {
    this.clips = mergeClips(data)?.map((clip) => new Clip(clip))
    this.raw = data
  }
  /** The unique identifier for this datalog. */
  public get id(): string {
    return this.raw.id
  }
  /** The day associated with this datalog. */
  public get day(): string {
    const dayValue = this.raw.day
    return typeof dayValue === 'number' ? dayValue.toString() : dayValue
  }
  /** The date of this datalog in ISO format. */
  public get date(): string {
    return this.raw.date
  }
  /**The production unit/team associated with this datalog. Example: Main-unit, Second-unit */
  public get unit(): string {
    return this.raw.unit ?? ''
  }

  private createCommonMethods(data: OcfType | SoundType | ProxyType | undefined) {
    return {
      files(): number {
        return getFiles(data)
      },
      /**
       * Gets the size formatted as a readable string.
       *
       * This method returns the size of the data in a user-friendly format, such as "1.17 GB" or "117 MB".
       * If there's a fixed `size` value, it uses that; otherwise, it calculates the size from the clips.
       * The default unit is 'auto', which automatically selects the most appropriate unit.
       * You can specify the unit of measurement you prefer by providing an options object.
       *
       * @param {Object} [options] - Optional settings for formatting the size.
       * @param {FormatBytesTypes} [options.type] - The unit for the size. Choose from:
       *   - `'auto'`: Automatically selects the most appropriate unit (e.g., MB, GB, TB). (default)
       *   - `'tb'`: Terabytes
       *   - `'gb'`: Gigabytes
       *   - `'mb'`: Megabytes
       *   - `'bytes'`: Bytes
       *
       * @returns {string} The formatted size as a string.
       *
       * @example
       * // Automatically choose the best unit
       * const sizeAuto = dataObject.ocf.size();
       * console.log(sizeAuto); // Output: "117 MB"
       *
       * // Specify the unit as Gigabytes
       * const sizeGB = dataObject.ocf.size({ type: 'gb' });
       * console.log(sizeGB); // Output: "0.117 GB"
       *
       */
      size(options?: { type: FormatBytesTypes }): string {
        return getSize(data, { output: 'string', type: options?.type })
      },
      /**
       * Retrieves the size as a numerical value.
       *
       * This method returns the size in a numerical format, which can be useful for calculations or comparisons.
       * If there's a fixed `size` value, it uses that; otherwise, it calculates the size from the clips.
       * You can specify the unit of measurement by providing an options object. The default unit is `bytes`.
       *
       * @param {Object} [options] - Optional settings for formatting the size.
       * @param {FormatBytesTypes} [options.type] - The unit for the size. Choose from:
       *   - `'auto'`: Automatically selects the most appropriate unit (e.g., KB, MB, GB).
       *   - `'tb'`: Terabytes
       *   - `'gb'`: Gigabytes
       *   - `'mb'`: Megabytes
       *   - `'bytes'`: Bytes (default)
       *
       * @returns {number} The size as a number.
       *
       * @example
       * // Get size in the default unit (bytes)
       * const sizeNumberDefault = dataObject.ocf.sizeAsNumber();
       * console.log(sizeNumberDefault); // Output: 117000000
       *
       * // Get size in Gigabytes
       * const sizeNumberGB = dataObject.ocf.sizeAsNumber({ type: 'gb' });
       * console.log(sizeNumberGB); // Output: 0.117
       *
       * // Get size in Megabytes
       * const sizeNumberMB = dataObject.ocf.sizeAsNumber({ type: 'mb' });
       * console.log(sizeNumberMB); // Output: 117
       */
      sizeAsNumber: (options?: { type: FormatBytesTypes }): number =>
        options ? getSize(data, { output: 'number', type: options.type }) : getSize(data),

      /**
       * Obtains the size as a pair containing both the numerical value and its unit.
       *
       * This method returns an array where the first element is the size number and the second element is the unit.
       * If there's a fixed `size` value, it uses that; otherwise, it calculates the size from the clips.
       * You can specify the unit of measurement by providing an options object.
       *
       * @param {Object} [options] - Optional settings for formatting the size.
       * @param {FormatBytesTypes} [options.type] - The unit for the size. Choose from:
       *   - `'auto'`: Automatically selects the most appropriate unit (e.g., MB, GB, TB). (default)
       *   - `'tb'`: Terabytes
       *   - `'gb'`: Gigabytes
       *   - `'mb'`: Megabytes
       *   - `'bytes'`: Bytes
       *
       * @returns {[number, string]} An array with the size number and its corresponding unit.
       *
       * @example
       * // Get size as a tuple with automatic unit
       * const sizeTupleAuto = dataObject.ocf.sizeAsTuple();
       * console.log(sizeTupleAuto); // Output: [117, 'MB']
       *
       * // Get size as a tuple in Gigabytes
       * const sizeTupleGB = dataObject.ocf.sizeAsTuple({ type: 'gb' });
       * console.log(sizeTupleGB); // Output: [0.117, 'GB']
       */
      sizeAsTuple: (options?: { type: FormatBytesTypes }): [number, string] =>
        getSize(data, { output: 'tuple', type: options?.type })
    }
  }

  public get ocf() {
    const ocfData = this.raw.ocf

    return {
      clips: ocfData?.clips ?? [],
      ...this.createCommonMethods(ocfData),
      /**
       * Retrieves the copies associated with this datalog.
       *
       * If the OCF has a fixed `copies` value, it will return that array.
       * Otherwise, it derives the copies from clips.
       *
       * @returns {{volumes: string[], clips: string[], count: [number, number]}[]} An array of copy objects.
       *
       * @example
       * const copies = dataObject.ocf.copies();
       * console.log(copies); // Output: [{ volumes: ['Volume1'], clips: ['A001C001'], count: [1, 10] }, ...]
       */
      copies: (): CopyType[] => getCopies(ocfData),
      reels: (options?: ReelsOptions): string[] => getReels(ocfData, options),
      /**
       * Retrieves the duration of the datalog in a human-readable string format. (e.g., "1h, 30m, 45s")
       *
       * If the datalog has a fixed `duration` value, this method returns a formatted string.
       * Otherwise, it calculates the total duration from the `clips` array.
       *
       * @returns {string} The duration as a readable string.
       *
       * @example
       * ```
       * const durationReadable = dataObject.ocf.duration();
       * console.log(durationReadable); // Output: "1h, 30m, 45s"
       * ```
       */
      duration: (): string => getDuration(ocfData, 'hms-string'),
      durationTC: (): string => getDuration(ocfData, 'tc'),
      durationObject: (): DurationType => getDuration(ocfData, 'hms'),
      /**
       * Retrieves the duration of the datalog in total seconds.
       *
       * If the datalog has a fixed `duration` value, this method returns the total seconds.
       * Otherwise, it calculates the total duration from the `clips` array.
       *
       * @returns {number} The total duration in seconds.
       *
       * @example
       * const durationSeconds = datalog.ocf.durationAsSeconds();
       * console.log(durationSeconds); // Output: 5445
       */
      durationAsSeconds: (): number => getDuration(ocfData, 'seconds')
    }
  }
  public get proxy() {
    const proxyData = this.raw.proxy

    return {
      clips: proxyData?.clips ?? [],
      ...this.createCommonMethods(proxyData)
    }
  }

  public get sound() {
    const soundData = this.raw.sound

    return {
      clips: soundData?.clips ?? [],
      ...this.createCommonMethods(soundData),
      /**
       * Retrieves the copies associated with this datalog.
       *
       * If the sound has a fixed `copies` value, it will return that array.
       * Otherwise, it derives the copies from clips.
       *
       * @return {CopyType[]} An array of copy objects.
       *
       * @example
       * const copies = dataObject.ocf.copies();
       * console.log(copies); // Output: [{ volumes: ['Volume1'], clips: ['clip1.wav'], count: [1, 10] }, ...]
       */
      copies: (): CopyType[] => getCopies(soundData)
    }
  }
}

export type DataObjectType = {
  project: ProjectRootType
  message: string
  datalog_selection: DatalogDynamicType | DatalogDynamicType[]
  datalog_all: DatalogDynamicType[]
}

export class DataObject {
  private _project: ProjectRootType
  private _datalog: Datalog
  private _datalogArray: Datalog[]
  private _datalogs: Datalog[]
  private _message: string

  constructor(data: DataObjectType) {
    const { datalog_selection: selection, datalog_all: all } = data

    if (!data.project) {
      throw new Error('Project is required to initialize DataObject.')
    }

    if (!all || all.length === 0) {
      throw new Error('The datalogs array must contain at least one DatalogType.')
    }

    if (!selection || (Array.isArray(selection) && selection.length === 0)) {
      throw new Error('The selection is empty')
    }

    this._project = data.project
    this._datalogs = all.map((data) => new Datalog(data))
    this._message = data.message

    if (Array.isArray(selection)) {
      // Merge the selected datalogs
      const mergedData = mergeDatalogs(selection)
      this._datalog = new Datalog(mergedData)
      this._datalogArray = selection.map((data) => new Datalog(data))
    } else {
      this._datalog = new Datalog(selection)
      this._datalogArray = [new Datalog(selection)]
    }
  }

  // Getter for the project name
  public get projectName(): string {
    return this._project.project_name
  }

  public get customInfo(): Record<string, string>[] | undefined {
    return this._project.custom_info
  }

  public get message(): string {
    return this._message
  }

  // Getter for the selected datalog (merged if multiple)
  public get datalog(): Datalog {
    return this._datalog
  }

  // Getter for the selected datalogs array
  public get datalogArray(): Datalog[] {
    return this._datalogArray
  }

  // Getter for all datalogs
  public get datalogs(): Datalog[] {
    return this._datalogs
  }

  private createCommonMethods(data, context: 'ocf' | 'proxy' | 'sound') {
    return {
      files: (): number => getTotalFiles(data, context),
      size: (options?: { type: FormatBytesTypes }): string =>
        getTotalSize(data, context, { output: 'string', type: options?.type }),
      sizeAsNumber: (options?: { type: FormatBytesTypes }): number =>
        options
          ? getTotalSize(data, context, { output: 'number', type: options.type })
          : getTotalSize(data, context),
      sizeAsTuple: (options?: { type: FormatBytesTypes }): [number, string] =>
        getTotalSize(data, context, { output: 'tuple', type: options?.type })
    }
  }

  public get total() {
    const all = this._datalogs

    const ocf = {
      ...this.createCommonMethods(all, 'ocf'),
      duration: (): string => getTotalDuration(all, 'hms-string'),
      durationTC: (): string => getTotalDuration(all, 'tc'),
      durationObject: (): DurationType => getTotalDuration(all, 'hms')
    }
    const proxy = { ...this.createCommonMethods(all, 'proxy') }

    const sound = { ...this.createCommonMethods(all, 'sound') }

    return {
      days: (): number => all.length,
      dateRange: (): [string, string] => getTotalDateRange(all),
      ocf,
      proxy,
      sound
    }
  }
}

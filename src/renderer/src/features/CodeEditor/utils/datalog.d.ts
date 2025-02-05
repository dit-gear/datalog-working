type CopyType = {
  volumes: string[]
  clips: string[]
  count: [number, number]
}

type DurationType = {
  hours: number
  minutes: number
  seconds: number
}

type Datalog = {
  /** The unique identifier for this datalog. */
  id: string
  /** The day associated with this datalog. */
  day: number
  /** The date of this datalog in ISO format. */
  date: string
  /**The unit/team associated with this datalog. Example: Main-unit, Second-unit */
  unit: string
  clips: Clip[]
  /** A collection of properties and methods for Original Camera Files (OCF)*/
  ocf: {
    /** OCF Clips (Original Camera Files) */
    clips: OcfClipType[]
    /**
     * Retrieves the total number of files.
     *
     * @returns {number} The total number of files.
     *
     * @example
     * ```
     * const totalFiles = datalog.ocf.files();
     * console.log(totalFiles); // Output: 5
     * ```
     */
    files(): number
    /**
     * Gets the size in a user-friendly format, such as "1.17 GB" or "117 MB".
     *
     * You can specify the unit of measurement you prefer by providing an options object.
     * The default unit is 'auto', which automatically selects the most appropriate unit.
     *
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
     * ```
     * // Automatically choose the best unit
     * const sizeAuto = datalog.ocf.size();
     * console.log(sizeAuto); // Output: "117 MB"
     *
     * // Specify the unit as Gigabytes
     * const sizeGB = datalog.ocf.size({ type: 'gb' });
     * console.log(sizeGB); // Output: "0.117 GB"
     *```
     */
    size(): string
    /**
     * Retrieves the size as a numerical value.
     *
     * This method returns the size in a numerical format, which can be useful for calculations or comparisons.
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
     * ```
     * // Get size in the default unit (bytes)
     * const sizeNumberDefault = dataObject.ocf.sizeAsNumber();
     * console.log(sizeNumberDefault); // Output: 117000000
     *``` ```
     * // Get size in Gigabytes
     * const sizeNumberGB = dataObject.ocf.sizeAsNumber({ type: 'gb' });
     * console.log(sizeNumberGB); // Output: 0.117
     *``` ```
     * // Get size in Megabytes
     * const sizeNumberMB = dataObject.ocf.sizeAsNumber({ type: 'mb' });
     * console.log(sizeNumberMB); // Output: 117
     * ```
     */
    sizeAsNumber(): number
    /**
     * Obtains the size as a pair containing both the numerical value and its unit.
     *
     * This method returns an array where the first element is the size number and the second element is the unit.
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
    sizeAsTuple(): [number, string]
    /**
     * Retrieves the copies as an array of objects.
     *
     *   - `volumes`: contain the volumes for the copy. : string[]
     *   - `clips`: contain the clip names in the copy. : string[]
     *   - `count`: contain the number of clips in this copy + total number of clips among all copies. If the first number is not equal to the second, it indicates that the copy is not complete. : [number, number]
     *
     * @returns {{volumes: string[], clips: string[], count: [number, number]}[]} An array of copy objects.
     *
     * @example
     * ```
     * const copies = dataObject.ocf.copies();
     * console.log(copies); // Output: [{ volumes: ['Volume1'], clips: ['A001C001'], count: [10, 10] }, ...]
     * ```
     */
    copies(): { volumes: string[]; clips: string[]; count: [number, number] }[]
    /**
     * Gets the reels as an array of strings.
     *
     * You can optionally group reels by passing `{rangeMerging=true}`
     *
     * @param {ReelsOptions} [options] - Optional settings for formatting reels.
     * @param {boolean} [options.rangeMerging=false] - Whether to group consecutive reels.
     *
     * @returns {string[]} An array of reel names.
     *
     * @example
     * ```// Retrieve reels without grouping (default)
     * const reels = dataObject.ocf.reels();
     * console.log(reels); // Output: ['Reel1', 'Reel2', 'Reel3']
     *
     * // Retrieve merged reels
     * const mergedReels = datalog.ocf.reels({ rangeMerging: true });
     * console.log(mergedReels); // Output: ['Reel1 - Reel3', '+ 2 other clips']
     * ```
     */
    reels(options?: ReelsOptions): string[]
    /**
     * Retrieves the duration in a human-readable string format. (e.g., "1h, 30m, 45s")
     *
     *
     * @returns {string} The duration as a readable string.
     *
     * @example
     * ```
     * const duration = datalog.ocf.duration();
     * console.log(duration); // Output: "1h, 30m, 45s"
     * ```
     */
    duration(): string
    /**
     * Retrieves the duration in timecode format. `[HH:MM:SS:FF]`
     *
     *
     * @returns {string} The duration in timecode format (e.g., "01:30:45:00").
     *
     * @example
     * ```
     * const durationTC = datalog.ocf.duration();
     * console.log(durationTC); // Output: "01:30:45:00"
     * ```
     */
    durationTC(): string
    /**
     * Retrieves the duration as an object with time components, hours, minutes, seconds.
     *
     * @returns {durationType} An object containing `hours`, `minutes`, and `seconds`.
     *
     * @example
     * ```
     * const durationObj = datalog.ocf.durationObject();
     * console.log(durationObj); // Output: { hours: 1, minutes: 30, seconds: 45 }
     * ```
     */
    durationObject(): DurationType
    /**
     * Retrieves the duration in total seconds. Suitable if you want to do your own calculations.
     *
     * @returns {number} The total duration in seconds.
     *
     * @example
     * ```
     * const durationSeconds = datalog.ocf.durationAsSeconds();
     * console.log(durationSeconds); // Output: 5445
     * ```
     */
    durationAsSeconds(): number
  }
  /** A collection of proxy related properties and methods */
  proxy: {
    /** Proxy Clips */
    clips: ProxyClipType[]
    /**
     * Retrieves the total number of files.
     *
     * @returns {number} The total number of files.
     *
     * @example
     * ```
     * const totalFiles = datalog.proxy.files();
     * console.log(totalFiles); // Output: 5
     * ```
     */
    files(): number
    /**
     * Gets the size in a user-friendly format, such as "1.17 GB" or "117 MB".
     *
     * You can specify the unit of measurement you prefer by providing an options object.
     * The default unit is 'auto', which automatically selects the most appropriate unit.
     *
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
     * ```
     * // Automatically choose the best unit
     * const sizeAuto = datalog.ocf.size();
     * console.log(sizeAuto); // Output: "117 MB"
     *
     * // Specify the unit as Gigabytes
     * const sizeGB = datalog.ocf.size({ type: 'gb' });
     * console.log(sizeGB); // Output: "0.117 GB"
     *```
     */
    size(): string
    /**
     * Retrieves the size as a numerical value.
     *
     * This method returns the size in a numerical format, which can be useful for calculations or comparisons.
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
     * ```
     * // Get size in the default unit (bytes)
     * const sizeNumberDefault = dataObject.ocf.sizeAsNumber();
     * console.log(sizeNumberDefault); // Output: 117000000
     *``` ```
     * // Get size in Gigabytes
     * const sizeNumberGB = dataObject.proxy.sizeAsNumber({ type: 'gb' });
     * console.log(sizeNumberGB); // Output: 0.117
     *``` ```
     * // Get size in Megabytes
     * const sizeNumberMB = dataObject.proxy.sizeAsNumber({ type: 'mb' });
     * console.log(sizeNumberMB); // Output: 117
     * ```
     */
    sizeAsNumber(): number
    /**
     * Obtains the size as a pair containing both the numerical value and its unit.
     *
     * This method returns an array where the first element is the size number and the second element is the unit.
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
     * const sizeTupleAuto = dataObject.proxy.sizeAsTuple();
     * console.log(sizeTupleAuto); // Output: [117, 'MB']
     *
     * // Get size as a tuple in Gigabytes
     * const sizeTupleGB = dataObject.proxy.sizeAsTuple({ type: 'gb' });
     * console.log(sizeTupleGB); // Output: [0.117, 'GB']
     */
    sizeAsTuple(): [number, string]
  }
  /** A collection of sound related properties and methods */
  sound: {
    /** Sound Clips */
    clips: SoundClipType[]
    /**
     * Retrieves the total number of files.
     *
     * @returns {number} The total number of files.
     *
     * @example
     * ```
     * const totalFiles = datalog.sound.files();
     * console.log(totalFiles); // Output: 5
     * ```
     */
    files(): number
    /**
     * Gets the size in a user-friendly format, such as "1.17 GB" or "117 MB".
     *
     * You can specify the unit of measurement you prefer by providing an options object.
     * The default unit is 'auto', which automatically selects the most appropriate unit.
     *
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
     * ```
     * // Automatically choose the best unit
     * const sizeAuto = datalog.proxy.size();
     * console.log(sizeAuto); // Output: "117 MB"
     *
     * // Specify the unit as Gigabytes
     * const sizeGB = datalog.proxy.size({ type: 'gb' });
     * console.log(sizeGB); // Output: "0.117 GB"
     *```
     */
    size(): string
    /**
     * Retrieves the size as a numerical value.
     *
     * This method returns the size in a numerical format, which can be useful for calculations or comparisons.
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
     * ```
     * // Get size in the default unit (bytes)
     * const sizeNumberDefault = dataObject.ocf.sizeAsNumber();
     * console.log(sizeNumberDefault); // Output: 117000000
     *``` ```
     * // Get size in Gigabytes
     * const sizeNumberGB = dataObject.sound.sizeAsNumber({ type: 'gb' });
     * console.log(sizeNumberGB); // Output: 0.117
     *``` ```
     * // Get size in Megabytes
     * const sizeNumberMB = dataObject.sound.sizeAsNumber({ type: 'mb' });
     * console.log(sizeNumberMB); // Output: 117
     * ```
     */
    sizeAsNumber(): number
    /**
     * Obtains the size as a pair containing both the numerical value and its unit.
     *
     * This method returns an array where the first element is the size number and the second element is the unit.
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
     * const sizeTupleAuto = dataObject.sound.sizeAsTuple();
     * console.log(sizeTupleAuto); // Output: [117, 'MB']
     *
     * // Get size as a tuple in Gigabytes
     * const sizeTupleGB = dataObject.sound.sizeAsTuple({ type: 'gb' });
     * console.log(sizeTupleGB); // Output: [0.117, 'GB']
     */
    sizeAsTuple(): [number, string]
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
    copies(): CopyType[]
  }
}

type ProjectData = {
  /**The name of the Project */
  projectName: string
  /** The selected datalog.
   *
   * If multiple datalogs are selected, their values will be merged.
   */
  datalog: Datalog
  /** The datalog selection as an array.*/
  datalogArray: Datalog[]
  /** All datalogs in the project */
  datalogs: Datalog[]
  /** A collection of methods for retrieving summaries of all datalogs */
  total: {
    ocf: {
      //** Total number of clips */
      files(): number
      /** Total Size */
      size(): string
      sizeAsNumber(): number
      sizeAsTuple(): [number, string]
      duration(): string
      durationTC(): string
      durationObject(): DurationType
    }
    proxy: {
      files(): number
      size(): string
      sizeAsNumber(): number
      sizeAsTuple(): [number, string]
    }
    sound: {
      files(): number
      size(): string
      sizeAsNumber(): number
      sizeAsTuple(): [number, string]
    }
  }
}

import { ZodTypeAny } from 'zod'
import { printNode, zodToTs, createTypeAlias } from 'zod-to-ts'
import {
  ClipDynamicZod,
  CopyType,
  OcfClipZod,
  OcfClipType,
  ProxyClipZod,
  ProxyClipType,
  SoundClipZod,
  SoundClipType
} from '@shared/datalogTypes' // Adjust import path
import { ProjectRootType } from '@shared/projectTypes'
import { ReelsOptionsZod, ReelsOptions } from '@shared/utils/format-reel'
//import { DataClassZod } from '@shared/datalogTypes'
import { DurationType } from '@shared/shared-types'
import datalogAST from './datalog.d.ts?raw'

function transformAstString(astString) {
  // Step 1: Remove all occurrences of (...args_n: unknown[]) (variadic arguments)
  const cleanedString = astString.replace(
    /\.\.\.args_\d+: unknown\[\]/g, // Match all (...args_n: unknown[])
    ''
  )

  // Step 2: Remove unnecessary commas left by the first step
  const commaCleanedString = cleanedString
    .replace(/,\s*,/g, ',')
    .replace(/\(\s*,/g, '(')
    .replace(/,\s*\)/g, ')')

  // Step 3: Rename "args_0" to "options?" AFTER cleaning up variadic args
  const renamedString = commaCleanedString.replace(
    /\(args_0:/, // Match the opening argument definition with args_0
    '(options?:'
  )

  return renamedString.trim() // Remove any extra spaces at the ends
}

const generatedynamicAST = (identifier: string, schema: ZodTypeAny): string => {
  const { node } = zodToTs(schema, identifier)
  const typeAlias = createTypeAlias(node, identifier)
  const rawDef = printNode(typeAlias)
  return transformAstString(rawDef)
}

export const createDataDefinition = (project: ProjectRootType) => {
  // Assume `project` is available here or passed into this module

  // Step 1: Generate the dynamic schema

  const ClipDynamicSchema = ClipDynamicZod(project)
  const ClipAST = generatedynamicAST('Clip', ClipDynamicSchema)

  const OcfClipTypeAST = generatedynamicAST('OcfClipType', OcfClipZod)
  const ProxyClipTypeAST = generatedynamicAST('ProxyClipType', ProxyClipZod)
  const SoundClipTypeAST = generatedynamicAST('SoundClipType', SoundClipZod)

  const getReelsOptionsAST = generatedynamicAST('ReelsOptions', ReelsOptionsZod)

  const combinedTypeDefs = `

  ${ClipAST}

  ${OcfClipTypeAST}
  ${ProxyClipTypeAST}
  ${SoundClipTypeAST}

  ${getReelsOptionsAST}

  ${datalogAST}

  type Datalog = {
  // ...
  clips: Clip[];
  // ...
}

declare global {
  interface Window {
    data: ProjectData;
  }
}

declare const data: ProjectData;
`

  return combinedTypeDefs
}

type DatalogClass = {
  id: string
  day: number
  date: string
  unit: string
  clips: any
  ocf: {
    clips: OcfClipType[]
    /**
     * Retrieves the total number of files.
     *
     *  If the datalog has a fixed `files` value, this method returns that number.
     * Otherwise, it counts the number of clips.
     *
     * @returns {number} The total number of files.
     *
     * @example
     * const totalFiles = dataObject.ocf.files();
     * console.log(totalFiles); // Output: 5
     */
    files(): number
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
    size(): string
    sizeAsNumber(): number
    sizeAsTuple(): [number, string]
    copies(): CopyType[]
    reels(options?: ReelsOptions): string[]
    duration(): string
    duration(): string
    durationObject(): DurationType
    durationAsSeconds(): number
  }
  proxy: {
    clips: ProxyClipType[]
    files(): number
    size(): string
    sizeAsNumber(): number
    sizeAsTuple(): [number, string]
  }
  sound: {
    clips: SoundClipType[]
    files(): number
    size(): string
    sizeAsNumber(): number
    sizeAsTuple(): [number, string]
    copies(): CopyType[]
  }
}

type ProjectData = {
  projectName: string
  datalog: DatalogClass
  datalogArray: DatalogClass[]
  datalogs: DatalogClass[]
  total: {
    ocf: {
      files(): number
      size(): string
      sizeAsNumber(): number
      sizeAsTuple(): [number, string]
      duration(): string
      duration(): string
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

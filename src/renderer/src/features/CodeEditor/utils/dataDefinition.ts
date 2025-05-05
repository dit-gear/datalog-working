import { ZodTypeAny } from 'zod'
import { printNode, zodToTs, createTypeAlias } from 'zod-to-ts'
import { ClipDynamicZod, OcfClipZod, ProxyClipZod, SoundClipZod } from '@shared/datalogTypes' // Adjust import path
import { ProjectRootType } from '@shared/projectTypes'
import { ReelsOptionsZod } from '@shared/utils/format-reel'
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

const clipMethods = `
  size(options?: { type: FormatBytesTypes }): string;
  sizeAsNumber(options?: { type: FormatBytesTypes }): number;
  sizeAsTuple(options?: { type: FormatBytesTypes }): [number, string];
  duration(): string;
  durationTC(): string;
  durationObject(): DurationType;
  durationAsSeconds(): number;
  durationAsFrames(): number;
  readonly proxy: {
    size(options?: { type: FormatBytesTypes }): string;
    sizeAsNumber(options?: { type: FormatBytesTypes }): number;
    sizeAsTuple(options?: { type: FormatBytesTypes }): [number, string];
    codec?: string;
    format?: string;
    resolution?: string
  };
`

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
  const ClipASTwMethods = ClipAST.replace(/(\}\s*;)$/, `${clipMethods}\n$1`)
  console.log('clipAST:', ClipASTwMethods)

  const OcfClipTypeAST = generatedynamicAST('OcfClipType', OcfClipZod)
  const ProxyClipTypeAST = generatedynamicAST('ProxyClipType', ProxyClipZod)
  const SoundClipTypeAST = generatedynamicAST('SoundClipType', SoundClipZod)

  const getReelsOptionsAST = generatedynamicAST('ReelsOptions', ReelsOptionsZod)

  const combinedTypeDefs = `

  ${ClipASTwMethods}

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
declare module 'data' {
  export const projectName: string;
  export const customInfo: Record<string, string>[] | undefined;
  export const message: string;
  export const datalog: Datalog;
  export const datalogArray: Datalog[];
  export const datalogs: Datalog[];
  export const total: {
    days(): number;
    dateRange(): [string, string];
    ocf: {
      files(): number;
      size(): string;
      sizeAsNumber(): number;
      sizeAsTuple(): [number, string];
      duration(): string;
      durationTC(): string;
      durationObject(): DurationType;
    };
    proxy: {
      files(): number;
      size(): string;
      sizeAsNumber(): number;
      sizeAsTuple(): [number, string];
    };
    sound: {
      files(): number;
      size(): string;
      sizeAsNumber(): number;
      sizeAsTuple(): [number, string];
    };
  };

`

  return combinedTypeDefs
}

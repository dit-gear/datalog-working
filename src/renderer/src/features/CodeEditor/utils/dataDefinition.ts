import { ZodTypeAny } from 'zod'
import { printNode, zodToTs, createTypeAlias } from 'zod-to-ts'
import { ClipDynamicZod, DatalogDynamicZod } from '@shared/datalogTypes' // Adjust import path
import { ProjectRootType } from '@shared/projectTypes'
import { getReelsOptionsZod } from '@shared/utils/format-reel'
import { DataClassZod } from '@shared/datalogTypes'

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

  const DatalogDynamicSchema = DatalogDynamicZod(project)
  const DatalogRawAST = generatedynamicAST('DatalogRaw', DatalogDynamicSchema)

  const getReelsOptionsAST = generatedynamicAST('getReelsOptions', getReelsOptionsZod)

  const combinedTypeDefs = `

  ${ClipAST}
  ${DatalogRawAST}
  ${getReelsOptionsAST}

type DatalogClass = {
  logName: string;
  day: number;
  date: string;
  clips: Clip[];
  ocf: {
    getFilesCount(): number;
    getSize(): string;
    getCopies(): string;
  };
  proxys: {
    getFilesCount(): number;
    getSize(): string;
  };
  getDuration(): string;
  getReels(options?: getReelsOptions): string[];
  raw: DatalogRaw;
};

type ProjectData = {
  projectName: string;
  datalog: DatalogClass;
  datalogArray: DatalogClass[];
  datalogs: DatalogClass[];
  totals: {
    getTotalOCFSize(): string;
    getTotalOCFFileCount(): number;
  };
};

declare global {
  interface Window {
    data: ProjectData;
  }
}


declare const data: ProjectData;
`

  return combinedTypeDefs
}

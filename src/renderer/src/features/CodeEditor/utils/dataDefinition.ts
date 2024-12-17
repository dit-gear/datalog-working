import z from 'zod'
import { printNode, zodToTs, createTypeAlias } from 'zod-to-ts'
import { DatalogDynamicZod } from '@shared/datalogTypes' // Adjust import path
import { ProjectRootType } from '@shared/projectTypes'
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

export const createDataDefinition = () => {
  // Assume `project` is available here or passed into this module

  // Step 1: Generate the dynamic schema
  //const DatalogDynamicSchema = DatalogDynamicZod(project)

  // Step 2: Convert Zod schema to TypeScript type definitions using zod-to-ts
  const identifier = 'DataObject'
  const { node } = zodToTs(DataClassZod, identifier)
  const typeAlias = createTypeAlias(node, identifier)
  const rawDef = printNode(typeAlias)

  const DataObject = transformAstString(rawDef)

  console.log(DataObject)
  const combinedTypeDefs = `
${DataObject}

declare global {
  interface Window {
    data: DataObject;
  }
}


declare const data: DataObject;
`

  return combinedTypeDefs
}

/*declare global {
  interface Window {
    data: DataObject;
  }
}*/

import fs from 'fs'
import z from 'zod'
import { ProjectSchemaZod } from '@shared/projectTypes'

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
)

const zodSchema = z.object({
  project: z.object({
    projectName: ProjectSchemaZod.shape.project_name,
    customFields: ProjectSchemaZod.shape.custom_fields.optional()
  })
})

export const loadMockData = async (filePath: string) => {
  const file = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(file)
  const projectValidation = zodSchema.safeParse(json)
  if (projectValidation.success) {
  }
}

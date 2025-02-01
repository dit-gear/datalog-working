import z from 'zod'
import { datalogZod, OCF, Sound, Proxy } from '@shared/datalogTypes'

function makeNullableExcept<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  keysToExclude: (keyof T)[]
) {
  const newShape = Object.fromEntries(
    Object.entries(schema.shape).map(([key, propSchema]) => [
      key,
      keysToExclude.includes(key as keyof T) ? propSchema : propSchema.nullable()
    ])
  )
  return z.object(newShape)
}

export const datalogFormSchema = z.object({
  id: z.string().min(1).max(50),
  day: z.coerce
    .number({
      required_error: 'Day is required',
      invalid_type_error: 'Day is required'
    })
    .int()
    .gte(1, { message: 'Day must be greater than or equal to 1' })
    .lte(999, { message: 'Day must be below 999' }),
  date: datalogZod.shape.date,
  unit: datalogZod.shape.unit.nullable(),
  ocf: makeNullableExcept(OCF, ['clips']),
  sound: makeNullableExcept(Sound, ['clips']),
  proxy: makeNullableExcept(Proxy, ['clips']),
  custom: datalogZod.shape.custom
})
export type datalogFormType = z.infer<typeof datalogFormSchema>

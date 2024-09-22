import z from 'zod'

const numberZod = z.preprocess((arg) => {
  if (typeof arg === 'string') {
    const parsed = Number(arg)
    return isNaN(parsed) ? undefined : parsed
  }
  return arg
}, z.number().positive().finite().lte(10000))

export function parseNumber(str: string): number {
  const validated = numberZod.safeParse(str)
  if (validated.success) {
    return validated.data
  } else {
    const errorMessages = validated.error.errors.map((err) => err.message).join(', ')
    throw new Error(`Invalid number: ${errorMessages}`)
  }
}

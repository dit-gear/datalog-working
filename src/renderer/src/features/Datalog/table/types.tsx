import z from 'zod'
import { datalogZod } from '@shared/datalogTypes'

const LogSum = datalogZod.pick({ id: true, day: true, date: true, unit: true }).extend({
  ocfSize: z.string(),
  proxySize: z.string(),
  duration: z.string(),
  reels: z.array(z.string()),
  raw: datalogZod
})
export type LogSum = z.infer<typeof LogSum>

import z from 'zod'
import { datalogZod } from '@shared/datalogTypes'

const LogSum = datalogZod.pick({ Folder: true, Day: true, Date: true, Unit: true }).extend({
  OCFSize: z.string(),
  ProxySize: z.string(),
  Duration: z.string(),
  Reels: z.array(z.string())
})
export type LogSum = z.infer<typeof LogSum>

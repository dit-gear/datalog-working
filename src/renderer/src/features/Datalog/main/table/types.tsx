import { DatalogType } from '@shared/datalogTypes'

export interface LogSum {
  id: string
  day: string
  date: string
  unit: string
  ocfSize: string
  proxySize: string
  duration: string
  reels: string[]
  raw: DatalogType
}

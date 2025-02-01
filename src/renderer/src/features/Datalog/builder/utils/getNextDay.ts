import { DatalogType } from '@shared/datalogTypes'

export function getNextDay(logs: DatalogType[]): number {
  let highestDay = logs[0].day

  for (const log of logs) {
    if (log.day > highestDay) {
      highestDay = log.day
    }
  }
  return highestDay + 1
}

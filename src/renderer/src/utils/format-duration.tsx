import { durationType } from '@shared/shared-types'

export const formatDuration = (time: number, isMilliseconds: boolean = true): durationType => {
  // Convert milliseconds to seconds if needed
  const totalSeconds = isMilliseconds ? Math.floor(time / 1000) : time

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds }
}

export const formatDurationToString = (time: number, isMilliseconds?: boolean): string => {
  const { hours, minutes, seconds } = formatDuration(time, isMilliseconds)

  const parts: string[] = []

  if (hours && hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes && minutes > 0) {
    parts.push(`${minutes}m`)
  }
  if ((seconds && seconds > 0) || (hours === 0 && minutes === 0)) {
    parts.push(`${seconds}s`)
  }

  return parts.join(', ')
}
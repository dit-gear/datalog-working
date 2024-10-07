import { durationType } from '@shared/shared-types'

export function formatDurationToMS(hours: number, minutes: number, seconds: number): number {
  const milliseconds = hours * 3600000 + minutes * 60000 + seconds * 1000
  return milliseconds
}

interface FormatDurationBaseOptions {
  unit?: 'ms' | 's'
}

// Options when asString is true
interface FormatDurationAsStringOptions extends FormatDurationBaseOptions {
  asString: true
  separator?: string // Optional separator, defaults to ','
}

// Options when asString is false or undefined
interface FormatDurationAsObjectOptions extends FormatDurationBaseOptions {
  asString?: false
}

// Union type for all possible options
export type FormatDurationOptions = FormatDurationAsStringOptions | FormatDurationAsObjectOptions

export function formatDuration(time: number, options?: FormatDurationAsObjectOptions): durationType
export function formatDuration(time: number, options: FormatDurationAsStringOptions): string

export function formatDuration(
  time: number,
  options: FormatDurationOptions = {}
): durationType | string {
  const unit = options.unit ?? 'ms'
  const totalSeconds = unit === 'ms' ? time / 1000 : time

  if (options.asString) {
    const sep = options.separator ?? ', '

    // If duration is less than 10 seconds, format seconds with one decimal
    if (totalSeconds < 10) {
      const formattedSeconds = totalSeconds.toFixed(1)
      return `${formattedSeconds}s`
    }

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)

    const parts: string[] = []

    if (hours > 0) {
      parts.push(`${hours}h`)
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`)
    }
    if (seconds > 0 || (hours === 0 && minutes === 0)) {
      parts.push(`${seconds}s`)
    }

    return parts.join(sep)
  } else {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)

    return { hours, minutes, seconds }
  }
}

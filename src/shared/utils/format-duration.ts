import { durationType } from '@shared/shared-types'

// Options when asString is true
interface FormatDurationAsStringOptions {
  asString: true
  separator?: string // Optional separator, defaults to ','
}

// Options when asString is false or undefined
interface FormatDurationAsObjectOptions {
  asString?: false
}

// Union type for all possible options
export type FormatDurationOptions = FormatDurationAsStringOptions | FormatDurationAsObjectOptions

/**
 * Formats a duration string into a human-readable string or an object with time components.
 *
 * The function accepts a time string in the format `"HH:MM:SS"` or `"HH:MM:SS:FF"`.
 * If the `FF` (frames) component is present, it is ignored.
 *
 * @param {string} time - The duration string to format. Supported formats:
 *   - `"HH:MM:SS"`: Hours (variable length), Minutes, Seconds.
 *   - `"HH:MM:SS:FF"`: Hours (variable length), Minutes, Seconds, Frames. The `FF` component is ignored.
 *
 * @param {FormatDurationOptions} [options={}] - Formatting options.
 *
 * @param {boolean} [options.asString=false] - Determines the output format.
 *   - If `true`, the duration is returned as a formatted string (e.g., `"1h, 30m, 45s"`).
 *   - If `false` or omitted, the duration is returned as an object with `hours`, `minutes`, and `seconds` properties.
 *
 * @param {string} [options.separator=', '] - The separator used in the formatted string when `asString` is `true`.
 *   - Defaults to `', '`.
 *
 * @returns {string | durationType} - The formatted duration.
 *   - Returns a `string` if `options.asString` is `true`.
 *   - Returns a `durationType` object (`{ hours: number; minutes: number; seconds: number; }`) if `options.asString` is `false` or not provided.
 *
 * @example
 * // Returns: { hours: 100, minutes: 30, seconds: 45 }
 * const durationObj = formatDuration("100:30:45");
 *
 * @example
 * // Returns: "100h, 30m, 45s"
 * const durationStr = formatDuration("100:30:45", { asString: true });
 *
 * @example
 * // Returns: { hours: 12, minutes: 34, seconds: 56 }
 * const durationWithFrames = formatDuration("12:34:56:78");
 *
 * @example
 * // Returns: "12h | 34m | 56s"
 * const formattedDuration = formatDuration("12:34:56:78", { asString: true, separator: ' | ' });
 */
export function formatDuration(time: string, options?: FormatDurationAsObjectOptions): durationType
export function formatDuration(time: string, options: FormatDurationAsStringOptions): string
export function formatDuration(
  time: string,
  options: FormatDurationOptions = {}
): durationType | string {
  const [hoursStr, minutesStr, secondsStr] = time.split(':')

  // Convert each to a number, defaulting to 0 if parse fails
  const hours = parseInt(hoursStr, 10) || 0
  const minutes = parseInt(minutesStr, 10) || 0
  const seconds = parseInt(secondsStr, 10) || 0

  if (options.asString) {
    const sep = options.separator ?? ', '
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
    return { hours, minutes, seconds }
  }
}

import { ZodObject, ZodEffects, ZodIssueCode } from 'zod'

/**
 * Checks if the given string is a valid timecode in the format "HH:MM:SS:FF".
 * Also checks if frames < fps, minutes < 60, seconds < 60.
 *
 * @param timecode - The timecode string to validate (e.g., "01:23:45:10")
 * @param fps      - Frames per second (used to validate that FF < fps)
 * @returns        - true if valid timecode format; otherwise false
 */
export function isValidTimecodeFormat(timecode: string, fps?: number): boolean {
  // Basic regex to match "HH:MM:SS:FF" pattern (H, M, S, F can be 1-2 digits)
  // This will capture hours, minutes, seconds, frames in capturing groups.
  const regex = /^(\d{1,2}):(\d{1,2}):(\d{1,2}):(\d{1,2})$/
  const match = timecode.match(regex)

  if (!match) {
    return false
  }

  // Extract each component as numbers
  const [_, hh, mm, ss, ff] = match
  const hours = Number(hh)
  const minutes = Number(mm)
  const seconds = Number(ss)
  const frames = Number(ff)

  // Validate ranges:
  // - minutes < 60
  // - seconds < 60
  // - frames < fps (e.g. 24, 25, 30, etc.)
  // (hours can typically be any non-negative integer, so we won't set an upper bound here.)
  if (
    minutes < 60 &&
    seconds < 60 &&
    frames < (fps ?? 99) &&
    minutes >= 0 &&
    seconds >= 0 &&
    frames >= 0 &&
    hours >= 0
  ) {
    return true
  }

  return false
}

/**
 * Helper: zero-pad a number to at least two digits (e.g. 3 => "03").
 */
function zeroPad(num: number, length: number = 2): string {
  return String(num).padStart(length, '0')
}

/**
 *    Convert a timecode (HH:MM:SS:FF) into total frames (integer),
 *    given an FPS (frames per second).
 *
 *    @param timecode - The timecode as "HH:MM:SS:FF"
 *    @param fps      - Frames per second
 *    @returns        - Total frames (number) for the given timecode
 */
export function timecodeToFrames(timecode: string, fps: number): number {
  const [hh, mm, ss, ff] = timecode.split(':').map(Number)

  // Total frames = (HH * 3600 + MM * 60 + SS) * fps + FF
  return hh * 3600 * fps + mm * 60 * fps + ss * fps + ff
}

/**
 *    Convert a timecode (HH:MM:SS:FF) into total seconds (integer),
 *    ignoring the frames (FF).
 *
 *    @param timecode - The timecode as "HH:MM:SS:FF"
 *    @returns        - Total seconds (number) for the given timecode
 */
export function timecodeToSeconds(timecode: string): number {
  const [hh, mm, ss] = timecode.split(':').slice(0, 3).map(Number)

  // Total seconds = HH * 3600 + MM * 60 + SS
  return hh * 3600 + mm * 60 + ss
}

/**
 * Helper: convert total frames back to timecode (HH:MM:SS:FF) given FPS.
 */
export function framesToTimecode(totalFrames: number, fps: number): string {
  // Compute hours, minutes, seconds, frames
  const hours = Math.floor(totalFrames / (3600 * fps))
  let remainder = totalFrames % (3600 * fps)

  const minutes = Math.floor(remainder / (60 * fps))
  remainder = remainder % (60 * fps)

  const seconds = Math.floor(remainder / fps)
  const frames = remainder % fps

  return (
    zeroPad(hours, 2) +
    ':' +
    zeroPad(minutes, 2) +
    ':' +
    zeroPad(seconds, 2) +
    ':' +
    zeroPad(frames, 2)
  )
}

/**
 * Helper: convert seconds to timecode (HH:MM:SS:FF)
 */
export function secondsToTimecode(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const remainder = totalSeconds % 3600
  const minutes = Math.floor(remainder / 60)
  const seconds = Math.floor(remainder % 60)

  return zeroPad(hours, 2) + ':' + zeroPad(minutes, 2) + ':' + zeroPad(seconds, 2) + ':00'
}

/**
 * Helper: convert seconds to large timecode (HHHH:MM:SS)
 */
export function secondsToLargeTimecode(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const remainder = totalSeconds % 3600
  const minutes = Math.floor(remainder / 60)
  const seconds = Math.floor(remainder % 60)

  return zeroPad(hours, 4) + ':' + zeroPad(minutes, 2) + ':' + zeroPad(seconds, 2)
}

/**
 *    Calculate the duration between two timecodes, both given in frames,
 *    and return the result in frames (integer). Same behavior as above,
 *    but purely numeric rather than timecode string.
 *
 *    @param startFrames - Start time in frames
 *    @param endFrames   - End time in frames
 *    @returns           - Duration in frames
 */
/*function getDurationInFrames(startFrames: number, endFrames: number): number {
  const duration = endFrames - startFrames
  return duration < 0 ? 0 : duration // or throw an error if negative
}*/

/**
 *    Check if one time range (a1, a2) overlaps or is inside the other
 *    (b1, b2). All four values are in frames.
 *    Returns true if [a1, a2] intersects with [b1, b2].
 *
 *    @param a1 - start of first range in frames
 *    @param a2 - end of first range in frames
 *    @param b1 - start of second range in frames
 *    @param b2 - end of second range in frames
 *    @returns  - boolean (true if overlaps)
 */
export function rangesOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
  // They do NOT overlap if one ends before the other starts:
  //   (a2 < b1) or (b2 < a1).
  // So overlap is the negation of that:
  if (a2 < b1 || b2 < a1) {
    return false
  }
  return true
}

/* ------------------------------------------------------------------
     Example usage:
  
     const frames25 = timecodeToFrames("17:13:38:23", 25); // => integer
     const differenceTimecode = getTimecodeDuration("17:13:38:23", "17:13:52:09", 25);
     // => "00:00:13:11"
  
     const duration = getDurationInFrames(frames25, timecodeToFrames("17:13:52:09", 25));
     // => integer (336 frames)
  
     const doTheyOverlap = rangesOverlap(100, 200, 150, 300);
     // => true
  ------------------------------------------------------------------ */

/**
 * Adds timecode validation to a Zod schema.
 *
 * @param schema - The Zod object schema to enhance.
 * @param timecodeFields - An array of field names that represent timecodes.
 * @returns A new Zod schema with the timecode validations applied.
 */
export function addTimecodeValidation<T extends ZodObject<any>>(
  schema: T,
  timecodeFields: string[]
): ZodEffects<T, T['_output'], T['_input']> {
  return schema.superRefine((data, ctx) => {
    const fps = data.fps

    if (data.duration && fps === undefined) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: 'fps is required when duration timecode is provided.',
        path: ['fps']
      })
      // Early return to prevent further validation if fps is missing
      return
    }

    if (fps !== undefined) {
      if (typeof fps !== 'number' || isNaN(fps) || fps <= 0) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: 'fps must be a valid positive number.',
          path: ['fps']
        })
        // Early return to prevent further validation if fps is invalid
        return
      }

      // Validate each provided timecode field
      timecodeFields.forEach((field) => {
        const timecodeValue = data[field]
        if (timecodeValue && !isValidTimecodeFormat(timecodeValue, fps)) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: `${field} in ${data['clip']}: "${timecodeValue}" is not a valid timecode format.`,
            path: [field]
          })
        }
      })
    }
  })
}

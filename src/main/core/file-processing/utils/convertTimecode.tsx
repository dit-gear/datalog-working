export function timecodeToTime(
  timecode: string,
  frameRate: number,
  outputUnit: 'ms' | 's' = 'ms'
): number {
  const parts = timecode.split(':').map(Number)

  if (parts.length !== 4) {
    throw new Error('Invalid timecode format')
  }

  const [hours, minutes, seconds, frames] = parts

  const unitFactor = outputUnit === 'ms' ? 1000 : 1

  const hoursInUnit = hours * 3600 * unitFactor
  const minutesInUnit = minutes * 60 * unitFactor
  const secondsInUnit = seconds * unitFactor

  const framesInUnit = (frames / frameRate) * unitFactor

  return hoursInUnit + minutesInUnit + secondsInUnit + framesInUnit
}

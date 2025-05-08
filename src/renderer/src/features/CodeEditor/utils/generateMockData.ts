import { DatalogDynamicType } from '@shared/datalogTypes'
import { ProjectRootType, Field } from '@shared/projectTypes'

// Helpers
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function convertFramesToTimecode(frames: number, fps = 24): string {
  const totalSeconds = Math.floor(frames / fps)
  const framePart = frames % fps
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${framePart
    .toString()
    .padStart(2, '0')}`
}

const generateRandomXXHash64 = (): string => {
  const hexChars = '0123456789abcdef'
  return Array.from(
    { length: 16 },
    () => hexChars[Math.floor(Math.random() * hexChars.length)]
  ).join('')
}

// Generate common clip names for a single day.
// We distribute numClips among reelsPerDay reels. Each clip gets assigned to a reel based on its index,
// and the clip name is formatted as "A###_C###" where "A###" is the reel (using the global reel number)
// and "C###" is the clip counter within that reel.
function generateCommonClipNamesForDay(
  numClips: number,
  initialReel: number,
  reelsPerDay: number = 8
): { clip: string; reel: string }[] {
  const clips: { clip: string; reel: string }[] = []
  const counters = new Map<number, number>()
  for (let i = 0; i < numClips; i++) {
    // Determine which reel this clip belongs to.
    const reelIndex = Math.floor((i * reelsPerDay) / numClips)
    const reelNumber = initialReel + reelIndex
    // Increment clip counter for this reel.
    const count = (counters.get(reelNumber) || 0) + 1
    counters.set(reelNumber, count)
    const reelStr = 'A' + reelNumber.toString().padStart(3, '0')
    const clipStr = `${reelStr}_C${count.toString().padStart(3, '0')}`
    clips.push({ clip: clipStr, reel: reelStr })
  }
  return clips
}

// Sound clip names: "0001.wav", "0002.wav", …
function generateSoundClipNames(numClips: number): string[] {
  return Array.from({ length: numClips }, (_, i) => (i + 1).toString().padStart(4, '0') + '.wav')
}

// Generate a set of timecodes for each clip.
function generateTimecodes(numClips: number, fps = 24): { tc_start: string; tc_end: string }[] {
  const timecodes: { tc_start: string; tc_end: string }[] = []
  let currentFrame = getRandomInt(0, 50)
  for (let i = 0; i < numClips; i++) {
    const tc_start = convertFramesToTimecode(currentFrame, fps)
    const durationFrames = getRandomInt(10, 50)
    const tc_end = convertFramesToTimecode(currentFrame + durationFrames, fps)
    timecodes.push({ tc_start, tc_end })
    currentFrame += getRandomInt(50, 150)
  }
  return timecodes
}

// Generate dynamic mock value for a custom field based on its type.
function generateMockForField(field: Field, index: number): any {
  switch (field.type) {
    case 'string':
      return `example_${field.value_key}_${index}`
    case 'list_of_strings':
      return [`example_${field.value_key}_${index}_1`, `example_${field.value_key}_${index}_2`]
    case 'list_of_field_arrays':
      return [[`example_${field.value_key}_${index}_1`, `example_${field.value_key}_${index}_2`]]
    case 'key-value_object':
      return { [`${field.value_key}_key`]: `example_${field.value_key}_${index}` }
    case 'list_of_mapped_objects':
      if (field.subfields && field.subfields.length) {
        const obj: Record<string, string> = {}
        field.subfields.forEach((sub) => {
          obj[sub.value_key] = `example_${sub.value_key}_${index}`
        })
        return [obj]
      }
      return []
    default:
      return null
  }
}

// Main mock data generator that returns an array of 15 datalog entries,
// one for each day. Reel numbers and dates increment continuously between days.
export function generateMockDatalog(project: ProjectRootType): DatalogDynamicType[] {
  const days = 15
  const numClips = 20
  const reelsPerDay = 8
  const baseDate = new Date('2025-01-01')
  const results: DatalogDynamicType[] = []

  // Loop over each day.
  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const dayNumber = dayIndex + 1
    // Calculate the date for this day.
    const currentDate = new Date(baseDate)
    currentDate.setDate(baseDate.getDate() + dayIndex)
    const dateStr = currentDate.toISOString().slice(0, 10)
    // Format date for id as YYYYMMDD.
    const idDateStr = dateStr.replace(/-/g, '')
    // Determine the starting reel number for this day.
    const initialReel = dayIndex * reelsPerDay + 1
    // Generate common clip names and related timecodes.
    const commonClips = generateCommonClipNamesForDay(numClips, initialReel, reelsPerDay)
    const soundClipNames = generateSoundClipNames(numClips)
    const timecodes = generateTimecodes(numClips, 24)

    // Build dynamic custom field entries.
    const customFieldDefs: Field[] = project.custom_fields?.fields || []
    const customEntries = commonClips.map((common, i) => {
      const entry: Record<string, any> = { clip: common.clip }
      customFieldDefs.forEach((field) => {
        entry[field.value_key] = generateMockForField(field, i + 1)
      })
      return entry
    })

    // Build OCF clips (conforming to OcfClipZod) with "reel".
    const ocfClips = commonClips.map((common, i) => {
      const hash = generateRandomXXHash64()
      return {
        clip: common.clip,
        size: 20482394213,
        copies: [
          { volume: 'raid1', hash },
          { volume: 'raid2', hash },
          { volume: 'shuttle1', hash }
        ],
        tc_start: timecodes[i].tc_start,
        tc_end: timecodes[i].tc_end,
        duration: timecodes[i].tc_end,
        camera_model: 'CinemaCamera',
        camera_id: '0001',
        reel: common.reel,
        fps: 24,
        sensor_fps: 24,
        shutter: 180,
        lens: '50mm',
        resolution: '3840x2160',
        codec: 'raw',
        gamma: 'log',
        ei: 800,
        wb: 5200,
        tint: '0',
        lut: 'monochrome_1'
      }
    })

    // Build Proxy clips (conforming to ProxyClipZod; no "reel").
    const proxyClips = commonClips.map((common) => ({
      clip: common.clip,
      size: 512023,
      format: 'mov',
      codec: '422proxy',
      resolution: '1920x1080'
    }))

    // Build Sound clips (conforming to SoundClipZod; no "reel").
    const soundClips = soundClipNames.map((clipName, i) => {
      const hash = generateRandomXXHash64()
      return {
        clip: clipName,
        size: 256,
        copies: [
          { volume: 'raid1', hash },
          { volume: 'raid2', hash },
          { volume: 'shuttle1', hash }
        ],
        tc_start: timecodes[i].tc_start,
        tc_end: timecodes[i].tc_end
      }
    })

    const id = `D${dayNumber.toString().padStart(2, '0')}${project.unit ?? 'A'}_${idDateStr}`

    results.push({
      id,
      day: dayNumber,
      date: dateStr,
      unit: project.unit ?? 'A',
      ocf: { clips: ocfClips },
      proxy: { clips: proxyClips },
      sound: { clips: soundClips },
      custom: customEntries
    } as DatalogDynamicType)
  }

  return results
}

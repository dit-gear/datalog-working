import { DatalogDynamicType } from '@shared/datalogTypes'
import { ProjectRootType, Field } from '@shared/projectTypes'

/*
const getRandomOption = (...options: string[]): string => {
  const randomIndex = Math.floor(Math.random() * options.length)
  return options[randomIndex]
}

const generateRandomXXHash64 = (): string => {
  const hexChars = '0123456789abcdef'
  return Array.from(
    { length: 16 },
    () => hexChars[Math.floor(Math.random() * hexChars.length)]
  ).join('')
}

const generateClipData = (): {
  size: number
  duration: number
  proxySize: number
} => {
  const bitrateMbps = 1884
  const proxyBitrateMbps = 102

  // Mock duration: Random duration between 10 seconds and 300 seconds (converted to ms)
  const duration = Math.floor(Math.random() * (300_000 - 10_000 + 1)) + 10_000

  // Convert duration to seconds for calculation
  const durationInSeconds = duration / 1000

  // Convert bitrates to bits per second
  const bitrateBps = bitrateMbps * 1_000_000
  const proxyBitrateBps = proxyBitrateMbps * 1_000_000

  // Calculate size in bytes for main clip
  const size = Math.floor((bitrateBps * durationInSeconds) / 8)

  // Calculate size in bytes for proxy
  const proxySize = Math.floor((proxyBitrateBps * durationInSeconds) / 8)

  return { size, duration, proxySize }
}

const generateMockClips = (project: InitialEditorData['activeProject']): Record<string, any>[] => {
  const additionalFieldsSchema = buildAdditionalFieldsSchema(project)

  // Extend the Clip schema dynamically with additional fields
  const extendedClipSchema = ClipDynamicZod(project)

  // Generate mock Clips with extended fields
  const mockClips = Array.from({ length: 30 }, (_, index) => {
    const randomHash = generateRandomXXHash64()
    const reel = `A0${Math.floor(index / 10) + 1}`
    const clipdata = generateClipData()
    const baseClipData = {
      clip: `${reel}_C00${(index % 10) + 1}`,
      size: clipdata.size,
      copies: Array.from({ length: 3 }, (_, copyIndex) => ({
        volume: `disk${copyIndex + 1}`,
        hash: randomHash
      })),
      duration: clipdata.duration,
      proxy: {
        size: clipdata.proxySize,
        format: 'mov',
        codec: 'prores422LT',
        Resolution: '1920x1080'
      },
      camera_model: 'cinemacamera',
      camera_id: '123',
      Reel: reel,
      FPS: '24',
      Sensor_FPS: '24.000',
      Lens: '',
      Focal_Lenght: '',
      Resolution: '3840x2160',
      Codec: 'RAW',
      Gamma: getRandomOption('600', '800', '1200'),
      WB: getRandomOption('3200', '4200', '5600'),
      Tint: getRandomOption('0', '-1'),
      LUT: getRandomOption('daylight', 'dawn_01', 'dawn_02', 'monochrome_1', 'teal')
    }

    // Add mock data for additional fields
    const additionalFields = Object.entries(additionalFieldsSchema).reduce(
      (acc, [key, schema]) => {
        if (schema instanceof z.ZodNumber) {
          acc[key] = Math.random() * 1000
        } else if (schema instanceof z.ZodString) {
          acc[key] = `Mock_${key}`
        } else if (schema instanceof z.ZodArray) {
          const itemSchema = schema.element
          if (itemSchema instanceof z.ZodString) {
            acc[key] = Array.from({ length: 3 }, () => `Mock_${key}_Item`)
          } else if (itemSchema instanceof z.ZodNumber) {
            acc[key] = Array.from({ length: 3 }, () => Math.random() * 1000)
          } else if (itemSchema instanceof z.ZodObject) {
            acc[key] = Array.from({ length: 3 }, () => generateMockDataFromSchema(itemSchema))
          }
        } else if (schema instanceof z.ZodObject) {
          acc[key] = generateMockDataFromSchema(schema)
        } else if (schema instanceof z.ZodBoolean) {
          acc[key] = Math.random() > 0.5
        } else if (schema instanceof z.ZodRecord) {
          acc[key] = { [`Mock_${key}_Key`]: `Mock_${key}_Value` }
        } else {
          acc[key] = `Unhandled_Type_${key}`
        }
        return acc
      },
      {} as Record<string, any>
    )

    return { ...baseClipData, ...additionalFields }
  })

  return mockClips
}

export const generateMockProjectJsonWithDynamicClips = (initialData: InitialEditorData): string => {
  if (!initialData) {
    throw new Error('Initial data is required to generate the JSON file.')
  }

  const { activeProject } = initialData

  if (!activeProject?.project_name) {
    throw new Error('Project name is missing in the active project.')
  }

  // Generate mock datalogs
  const mockDatalogCount = 5
  const mockDatalogs = Array.from({ length: mockDatalogCount }, (_, index) => {
    const mockClips = generateMockClips(activeProject)

    return {
      Folder: `MockFolder_${index}`,
      Day: index + 1,
      Date: new Date().toISOString(),
      Unit: `MockUnit_${index}`,
      OCF: {
        Files: index * 10,
        Size: index * 1000
      },
      Proxy: {
        Files: index * 5,
        Size: index * 500
      },
      Duration: index * 3600, // Mock duration in seconds
      Reels: [`Reel_${index}_1`, `Reel_${index}_2`],
      Copies: [`Copy_${index}_1`, `Copy_${index}_2`],
      Clips: mockClips
    }
  })

  const mockSelection = mockDatalogs[mockDatalogCount - 1] // Last mock datalog is the selection

  const jsonData = {
    projectName: activeProject.project_name,
    selection: mockSelection,
    all: mockDatalogs
  }

  return JSON.stringify(jsonData, null, 2)
}

export const generateProjectJson = (initialData: InitialEditorData): string => {
  if (!initialData) {
    throw new Error('Initial data is required to generate the JSON file.')
  }

  const { activeProject, loadedDatalogs } = initialData

  if (!activeProject?.project_name) {
    throw new Error('Project name is missing in the active project.')
  }

  if (!loadedDatalogs || loadedDatalogs.length === 0) {
    throw new Error('No datalogs found in the loaded datalogs.')
  }

  const jsonData = {
    project: {
      projectName: activeProject.project_name,
      additionalFields: activeProject.custom_fields
    },
    datalog: loadedDatalogs[loadedDatalogs.length - 1], // Get the latest datalog
    datalogs: loadedDatalogs // List all datalogs
  }

  return JSON.stringify(jsonData, null, 2) // Prettify the JSON string
}
*/

// OLD

/*
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

// Generate common clip names with dynamic "reel" values.
// The clip name format is "A###_C###" where the "A###" part (reel)
// increments at clip indices 5, 8, 9, 10, 14, 15, and 20.
function generateCommonClipNames(numClips: number): { clip: string; reel: string }[] {
  const thresholds = new Set([5, 8, 9])
  const clips = []
  let currentReel = 1
  let localCounter = 0
  for (let i = 1; i <= numClips; i++) {
    if (i === 1) {
      localCounter = 1
    } else if (thresholds.has(i)) {
      currentReel++
      localCounter = 1
    } else {
      localCounter++
    }
    const reelStr = 'A' + currentReel.toString().padStart(3, '0')
    const clipStr = `${reelStr}_C${localCounter.toString().padStart(3, '0')}`
    clips.push({ clip: clipStr, reel: reelStr })
  }
  return clips
}

// Sound clip names: "0001.wav", "0002.wav", …
function generateSoundClipNames(numClips: number): string[] {
  return Array.from({ length: numClips }, (_, i) => (i + 1).toString().padStart(4, '0') + '.wav')
}

// Generate a set of timecodes (shared by ocf and sound) that increment randomly.
function generateTimecodes(numClips: number, fps = 24): { tc_start: string; tc_end: string }[] {
  const timecodes = []
  let currentFrame = getRandomInt(0, 50) // random start offset
  for (let i = 0; i < numClips; i++) {
    const tc_start = convertFramesToTimecode(currentFrame, fps)
    const durationFrames = getRandomInt(10, 50)
    const tc_end = convertFramesToTimecode(currentFrame + durationFrames, fps)
    timecodes.push({ tc_start, tc_end })
    currentFrame += getRandomInt(50, 150)
  }
  return timecodes
}

// Generate dynamic mock value based on a custom field's type.
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

// Main mock data generator.
export function generateMockDatalog(project: ProjectRootType) {
  const numClips = 20
  const commonClips = generateCommonClipNames(numClips)
  const soundClipNames = generateSoundClipNames(numClips)
  const timecodes = generateTimecodes(numClips, 24)

  // Dynamic custom fields based on project.custom_fields.fields.
  const customFieldDefs: Field[] = project.custom_fields?.fields || []
  const customEntries = commonClips.map((common, i) => {
    const entry: Record<string, any> = { clip: common.clip }
    customFieldDefs.forEach((field) => {
      entry[field.value_key] = generateMockForField(field, i + 1)
    })
    return entry
  })

  // OCF clips: include clip name, incremented timecodes, and "reel" matching the first four characters.
  const ocfClips = commonClips.map((common, i) => {
    const hash = generateRandomXXHash64()
    return {
      clip: common.clip,
      size: 20482394213,
      copies: [
        { volume: 'raid1', hash: hash },
        { volume: 'raid2', hash: hash },
        { volume: 'shuttle1', hash: hash }
      ],
      tc_start: timecodes[i].tc_start,
      tc_end: timecodes[i].tc_end,
      duration: timecodes[i].tc_end,
      camera_model: 'CinemaCamera',
      camera_id: '0001',
      reel: common.reel, // Only in ocf
      fps: 24,
      sensor_fps: '24',
      lens: '50mm',
      resolution: '3840x2160',
      codec: 'raw',
      gamma: '800',
      wb: '5200',
      tint: '0',
      lut: 'monochrome_1'
    }
  })

  // Proxy clips: only clip and "ree".
  const proxyClips = commonClips.map((common) => ({
    clip: common.clip,
    size: 512023,
    format: 'mov',
    codec: '422proxy',
    resolution: '1920x1080'
  }))

  // Sound clips: different naming, but matching timecodes with ocf.
  const soundClips = soundClipNames.map((clipName, i) => {
    const hash = generateRandomXXHash64()
    return {
      clip: clipName,
      size: 256,
      copies: [
        { volume: 'raid1', hash: hash },
        { volume: 'raid2', hash: hash },
        { volume: 'shuttle1', hash: hash }
      ],
      tc_start: timecodes[i].tc_start,
      tc_end: timecodes[i].tc_end
    }
  })

  const date = new Date().toISOString().slice(0, 10)

  return {
    id: 'D01A_20250210',
    day: 1,
    date: date,
    unit: project.unit ?? 'A',
    ocf: { clips: ocfClips },
    proxy: { clips: proxyClips },
    sound: { clips: soundClips },
    custom: customEntries
  } as DatalogDynamicType
}
*/

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
        sensor_fps: '24',
        lens: '50mm',
        resolution: '3840x2160',
        codec: 'raw',
        gamma: '800',
        wb: '5200',
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

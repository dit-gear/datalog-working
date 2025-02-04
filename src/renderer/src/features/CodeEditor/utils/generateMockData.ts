import { InitialEditorData } from '@shared/shared-types'
/*import { ClipDynamicZod } from '@shared/datalogTypes'

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

/*
const generateMockClips = (
    project: InitialEditorData['activeProject']
  ): Record<string, any>[] => {
    const additionalFieldsSchema = buildAdditionalFieldsSchema(project)
  
    // Extend the Clip schema dynamically with additional fields
    const extendedClipSchema = ClipDynamicZod(project)
  
    // Generate mock Clips with extended fields
    const mockClips = Array.from({ length: 30 }, (_, index) => {
    const randomHash = generateRandomXXHash64()
    const reel = `A0${Math.floor(index / 10) + 1}`
    const clipdata = generateClipData()
      const baseClipData = {
        Clip: `${reel}_C00${index % 10 + 1}`,
        Size: clipdata.size,
        Copies: Array.from({ length: 3 }, (_, copyIndex) => ({
            Path: `disk${copyIndex + 1}/fakepath/ocf/`,
            Hash: randomHash
          })),
        Duration: clipdata.duration,
        Proxy: {
          Path: '/fakepath/proxies/',
          Size: clipdata.proxySize,
          Format: 'mov',
          Codec: 'prores422LT',
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
        LUT: getRandomOption('daylight', 'dawn_01', 'dawn_02', 'monochrome_1', 'teal'),
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

  export const generateMockProjectJsonWithDynamicClips = (
    initialData: InitialEditorData
  ): string => {
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
*/

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

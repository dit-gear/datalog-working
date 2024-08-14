import { date } from 'zod'

// Define the type for a single clip
type Clip = {
  name: string
  size: number
}

// Define the type for a day
type Day = {
  day: number
  clips: Clip[]
  totalSize: number // This will represent either a fixed value or the result of the getter
}

// Define the type for the entire data structure
type Data = {
  days: Day[]
  totalSize: number // This will represent the total size across all days
}

const data: Data = {
  days: [
    {
      day: 1,
      get totalSize(): number {
        return this.clips.reduce((sum: number, clip: Clip) => sum + clip.size, 0)
      },
      clips: [
        { name: 'clip1', size: 30 },
        { name: 'clip2', size: 40 },
        { name: 'clip3', size: 15 }
      ]
    },
    {
      day: 2,
      totalSize: 123, // This is a fixed value
      clips: [
        { name: 'clip4', size: 10 },
        { name: 'clip5', size: 33 },
        { name: 'clip6', size: 11 }
      ]
    },
    {
      day: 3,
      get totalSize(): number {
        return this.clips.reduce((sum: number, clip: Clip) => sum + clip.size, 0)
      },
      clips: [
        { name: 'clip7', size: 31 },
        { name: 'clip8', size: 44 },
        { name: 'clip9', size: 31 }
      ]
    }
  ],
  get totalSize(): number {
    return this.days.reduce((sum: number, day: Day) => sum + day.totalSize, 0)
  }
}

const datalog = {
  days: [
    {
      day: 1,
      get totalSize(): number {
        return this.clips.reduce((sum: number, clip: Clip) => sum + clip.size, 0)
      },
      clips: [
        { name: 'clip1', size: 30 },
        { name: 'clip2', size: 40 },
        { name: 'clip3', size: 15 }
      ]
    },
    {
      day: 2,
      totalSize: 123, // This is a fixed value
      clips: [
        { name: 'clip4', size: 10 },
        { name: 'clip5', size: 33 },
        { name: 'clip6', size: 11 }
      ]
    },
    {
      day: 3,
      get totalSize(): number {
        return this.clips.reduce((sum: number, clip: Clip) => sum + clip.size, 0)
      },
      clips: [
        { name: 'clip7', size: 31 },
        { name: 'clip8', size: 44 },
        { name: 'clip9', size: 31 }
      ]
    }
  ],
  get totalSize(): number {
    return this.days.reduce((sum: number, day: Day) => sum + day.totalSize, 0)
  }
}

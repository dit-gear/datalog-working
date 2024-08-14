import Papaparse from 'papaparse'
import fs from 'fs'

interface ALEFileData {
  Name?: string
  Reel_name?: string
  Duration?: string
  FPS?: string
  Scene?: string
  Take?: string
}

type aleData = {
  Clip?: string
  Reel?: string
  Duration?: number
  Fps?: string
  Scene?: string
  Take?: string
}
function timecodeToSeconds(timecode: string, frameRate: number): number {
  const parts = timecode.split(':').map(Number)

  if (parts.length !== 4) {
    throw new Error('Invalid timecode format')
  }

  const [hours, minutes, seconds, frames] = parts
  return Math.floor(hours * 3600 + minutes * 60 + seconds + frames / frameRate)
}

async function processALE(filePaths: string[]): Promise<aleData[]> {
  const fileResults = await Promise.all(
    filePaths.map(async (filePath) => {
      return new Promise<aleData[]>((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reject(err)
            return
          }
          const lines = data.split('\n')
          const headerIndex = lines.findIndex(
            (line) => line.includes('Name') && line.includes('Reel_name')
          )
          if (headerIndex === -1) {
            reject(new Error('Header row not found'))
            return
          }
          // Slice the data from the header row onwards
          const records = lines
            .slice(headerIndex)
            .filter((line) => !line.startsWith('Data'))
            .join('\n')

          Papaparse.parse<ALEFileData>(records, {
            delimiter: '\t',
            skipEmptyLines: true,
            header: true,
            complete: (results) => {
              const parsedData = results.data.map((item: ALEFileData) => {
                let result: Partial<aleData> = {} // eslint-disable-line prefer-const
                if (item.Name && item.Name.trim() !== '') {
                  result.Clip = item.Name
                }
                if (item.Reel_name && item.Reel_name.trim() !== '') {
                  result.Reel = item.Reel_name
                }
                if (
                  item.Duration &&
                  item.Duration.trim() !== '' &&
                  item.FPS &&
                  item.FPS.trim() !== ''
                ) {
                  if (item.Duration.includes(':') && item.FPS) {
                    const TC = item.Duration
                    const FPS = item.FPS ? parseFloat(item.FPS) : 0
                    const duration = timecodeToSeconds(TC, FPS)
                    result.Duration = duration
                  }
                }
                if (item.Scene && item.Scene.trim() !== '') {
                  result.Scene = item.Scene
                }
                if (item.Take && item.Take.trim() !== '') {
                  result.Take = item.Take
                }
                return result
              })
              resolve(parsedData)
            },
            error: (error) => {
              reject(error)
            }
          })
        })
      })
    })
  )
  return fileResults.flat()
}
export default processALE

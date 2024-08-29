import { BrowserWindow } from 'electron'
import { DestinationData } from '../../shared/shared-types'
import { XMLParser, XMLValidator } from 'fast-xml-parser'
import fs from 'fs'
import { mhlSchema, AscMhlschema } from './mhl-schemas'

const extensions = [
  '.mov',
  '.mxf',
  '.ari',
  '.arx',
  '.cine',
  '.dng',
  '.exr',
  '.r3d',
  '.rmd',
  '.mp4',
  '.avi',
  '.mkv',
  '.flv',
  '.mpg',
  '.mpeg',
  '.m4v'
]

function readAndParseMHLFiles(
  filePaths: string[],
  progressCallback: (progress: number) => void
): Promise<DestinationData[]> {
  let processedFiles = 0
  const updateProgress = (): void => {
    processedFiles++
    const progress = processedFiles / filePaths.length
    progressCallback(progress) // Report progress
  }
  return Promise.all(
    filePaths.map(
      (filePath) =>
        new Promise<DestinationData[]>((resolve, reject) => {
          fs.readFile(filePath, 'utf8', (err, fileData) => {
            if (err) {
              reject(err)
              return
            }

            const options = {
              attributeNamePrefix: '', // Remove the prefix entirely
              attrNodeName: false, // Ensure attributes are not grouped under a separate object
              textNodeName: 'text',
              ignoreAttributes: false, // Do not ignore the attributes; integrate them directly
              parseNodeValue: false,
              parseAttributeValue: true
            }
            const parser = new XMLParser(options)

            if (XMLValidator.validate(fileData) === true) {
              const parsed = parser.parse(fileData)
              const mhlClassicValidator = mhlSchema.safeParse(parsed)
              const ascMhlValidator = AscMhlschema.safeParse(parsed)
              if (mhlClassicValidator.success) {
                const mhlData = mhlClassicValidator.data
                const filteredFiles = mhlData.hashlist.hash.filter((row) =>
                  extensions.some((ext) => row.file.toLowerCase().endsWith(ext))
                )
                // Process the data and group by common Clip name
                const grouped = filteredFiles.reduce((acc, row) => {
                  // Extract the base clip name
                  const baseClipName = row.file.split('/').pop()!.split('.')[0]

                  // Initialize if not present
                  acc[baseClipName] = acc[baseClipName] || {
                    Clip: baseClipName,
                    Size: 0
                  }

                  // Sum the sizes
                  acc[baseClipName].Size += !isNaN(Number(row.size)) ? Number(row.size) : 0

                  return acc
                }, {})
                // Convert the grouped object into an array
                const combinedData = Object.values(grouped) as unknown as DestinationData[]
                updateProgress()
                resolve(combinedData)
              } else if (ascMhlValidator.success) {
                const mhlData = ascMhlValidator.data
                const filteredFiles = mhlData.hashlist.hashes.hash.filter((row) =>
                  extensions.some((ext) => row.path.text.toLowerCase().endsWith(ext))
                )
                // Process the data and group by common Clip name
                const grouped = filteredFiles.reduce((acc, row) => {
                  // Extract the base clip name
                  const baseClipName = row.path.text.split('/').pop()!.split('.')[0]

                  // Initialize if not present
                  acc[baseClipName] = acc[baseClipName] || {
                    Clip: baseClipName,
                    Size: 0
                  }

                  // Sum the sizes
                  acc[baseClipName].Size += !isNaN(Number(row.path.size))
                    ? Number(row.path.size)
                    : 0

                  return acc
                }, {})
                // Convert the grouped object into an array
                const combinedData = Object.values(grouped) as DestinationData[]
                updateProgress()
                resolve(combinedData)
              } else {
                reject('Error parsing MHL file')
              }
            } else {
              reject('Invalid XML file')
            }
          })
        })
    )
  ).then((results) => {
    const combinedData: DestinationData[] = []
    results.forEach((data) => combinedData.push(...data))
    return combinedData
  })
}

async function processMHL(
  mhlFiles: string[],
  mainWindow: BrowserWindow
): Promise<DestinationData[]> {
  let progress = 0
  let isCancelled = false
  let showProgressFlag = false

  const progressTimeout = setTimeout(() => {
    if (isCancelled) return
    showProgressFlag = true
    mainWindow?.webContents.send('show-progress', 0)
  }, 100)

  const progressCallback = (updatedProgress: number): void => {
    progress = updatedProgress
    console.log(`Current Progress: ${progress * 100}%`)
    if (showProgressFlag) {
      mainWindow?.setProgressBar(progress)
      mainWindow?.webContents.send('show-progress', true, progress)
    }
  }

  try {
    progressTimeout
    const data = await readAndParseMHLFiles(mhlFiles, progressCallback)
    mainWindow.setProgressBar(-1) // Reset the progress bar
    mainWindow.webContents.send('show-progress', false, -1)
    clearTimeout(progressTimeout)
    return data
  } catch (error) {
    clearTimeout(progressTimeout)
    console.error('Error processing MHL files:', error)
    throw error // or handle it as needed
  }
}

export default processMHL

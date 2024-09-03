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
const sequentialFileTypes = new Set(['.dng', '.arx', '.ari', '.mxf', '.exr', '.r3d', '.braw'])

async function readAndParseMHLFiles(
  filePaths: string[],
  progressCallback: (progress: number) => void
): Promise<DestinationData[]> {
  let processedFiles = 0
  const updateProgress = (): void => {
    processedFiles++
    const progress = processedFiles / filePaths.length
    progressCallback(progress) // Report progress
  }
  const results = await Promise.all(
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
              parseTagValue: false,
              parseAttributeValue: false
            }
            const XMLparser = new XMLParser(options)

            if (XMLValidator.validate(fileData) === true) {
              const parsedXML = XMLparser.parse(fileData)
              //console.log(parsed)
              const mhlClassicValidator = mhlSchema.safeParse(parsedXML)
              const ascMhlValidator = AscMhlschema.safeParse(parsedXML)
              if (mhlClassicValidator.error) {
                console.error(mhlClassicValidator.error)
              }
              if (mhlClassicValidator.success) {
                const mhlData = mhlClassicValidator.data
                const filteredFiles = mhlData.hashlist.hash.filter((row) =>
                  extensions.some((ext) => row.file.toLowerCase().endsWith(ext))
                )
                const grouped = filteredFiles.reduce((acc, row_1) => {
                  const fileName = row_1.file.split('/').pop()!
                  const extension = '.' + fileName.split('.').pop()?.toLowerCase()

                  let baseClipName = fileName

                  // Check if filetype is likely to be sequential and handle formating.
                  if (sequentialFileTypes.has(extension)) {
                    const match = fileName.match(/^(.*?)(?:[._]\d+)?\.[a-zA-Z0-9]+$/)
                    baseClipName = match ? match[1] : fileName
                  }

                  acc[baseClipName] = acc[baseClipName] || {
                    Clip: baseClipName,
                    Size: 0
                  }

                  // Sum the sizes
                  acc[baseClipName].Size += !isNaN(Number(row_1.size)) ? Number(row_1.size) : 0

                  return acc
                }, {})
                // Convert the grouped object into an array
                const combinedData = Object.values(grouped) as unknown as DestinationData[]
                console.log(combinedData)
                updateProgress()
                resolve(combinedData)
              } else if (ascMhlValidator.success) {
                const mhlData_1 = ascMhlValidator.data
                const filteredFiles_1 = mhlData_1.hashlist.hashes.hash.filter((row_2) =>
                  extensions.some((ext_1) => row_2.path.text.toLowerCase().endsWith(ext_1))
                )
                // Process the data and group by common Clip name
                const grouped_1 = filteredFiles_1.reduce((acc_1, row_3) => {
                  // Extract the base clip name
                  const baseClipName_1 = row_3.path.text.split('/').pop()!.split('.')[0]

                  // Initialize if not present
                  acc_1[baseClipName_1] = acc_1[baseClipName_1] || {
                    Clip: baseClipName_1,
                    Size: 0
                  }

                  // Sum the sizes
                  acc_1[baseClipName_1].Size += !isNaN(Number(row_3.path.size))
                    ? Number(row_3.path.size)
                    : 0

                  return acc_1
                }, {})
                // Convert the grouped object into an array
                const combinedData_1 = Object.values(grouped_1) as DestinationData[]
                updateProgress()
                resolve(combinedData_1)
              } else {
                reject('Error parsing MHL file')
              }
            } else {
              reject('Invalid XML file')
            }
          })
        })
    )
  )
  const combinedData_2: DestinationData[] = []
  results.forEach((data_2) => combinedData_2.push(...data_2))
  return combinedData_2
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

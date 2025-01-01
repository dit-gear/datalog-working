import { BrowserWindow } from 'electron'
import { ClipType } from '@shared/datalogTypes'
import fs from 'fs'
import { mhlClassicZod, mhlClassicType, classicRow } from './schemas/classic-mhl-schema'
import { mhlAscZod, mhlAscType, ascRow } from './schemas/asc-mhl-schema'
import logger from '../../logger'
import { parseXML } from '../utils/xml-parser'

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

type ValidationResult =
  | { success: true; data: mhlClassicType; type: 'classic'; error: null }
  | { success: true; data: mhlAscType; type: 'asc'; error: null }
  | {
      success: false
      data: null
      type: null
      error: { classicErrors: any; ascErrors: any; mhlInfo?: string }
    }

async function getValidMhlData(parsedXML: any): Promise<ValidationResult> {
  const mhlClassicValidator = mhlClassicZod.safeParse(parsedXML)

  if (mhlClassicValidator.success) {
    return { success: true, data: mhlClassicValidator.data, type: 'classic', error: null }
  }

  // Only if mhlClassic parsing fails, try ascMhl schema
  const ascMhlValidator = mhlAscZod.safeParse(parsedXML)

  if (ascMhlValidator.success) {
    return { success: true, data: ascMhlValidator.data, type: 'asc', error: null }
  }
  const xmlversion = String(parsedXML['?xml']?.version || 'unknown version')
  const encoding = String(parsedXML['?xml']?.encoding || 'unknown encoding')
  const hashversion = String(parsedXML['?xml']?.hashlist?.version || 'unknown version')
  const mhlInfo = `MHL Info - XML version: ${xmlversion}, Encoding: ${encoding}, Hashlist version: ${hashversion}`

  return {
    success: false,
    data: null,
    type: null,
    error: {
      classicErrors: mhlClassicValidator.error,
      ascErrors: ascMhlValidator.error,
      mhlInfo
    }
  }
}

function isClassicRow(row: classicRow | ascRow): row is classicRow {
  return (row as classicRow).file !== undefined
}

async function processFile(
  filePath: string,
  path: string,
  extensions: string[],
  sequentialFileTypes: Set<string>
): Promise<ClipType[]> {
  try {
    const fileData = fs.readFileSync(filePath, 'utf8')
    const parsedXML = await parseXML(fileData)
    const { success, data, type, error } = await getValidMhlData(parsedXML)

    if (!success) {
      const msg = 'Error parsing MHL file'
      logger.error(`${msg}:`, error)
      throw new Error(msg)
    }

    logger.debug('success')
    let filteredFiles: classicRow[] | ascRow[] = []

    if (type === 'classic') {
      logger.debug('is mhlclassic')
      const mhlData = data as mhlClassicType
      filteredFiles = (
        Array.isArray(mhlData.hashlist.hash) ? mhlData.hashlist.hash : [mhlData.hashlist.hash]
      ).filter((row) => extensions.some((ext) => row.file.toLowerCase().endsWith(ext)))
    } else if (type === 'asc') {
      logger.debug('is ascmhl')
      filteredFiles = (data as mhlAscType).hashlist.hashes.hash.filter((row) =>
        extensions.some((ext) => row.path.text.toLowerCase().endsWith(ext))
      )
    }

    const grouped = filteredFiles.reduce(
      (acc, row) => {
        const isClassic = isClassicRow(row)
        const fileNameWithExtension = isClassic
          ? row.file.split('/').pop()!
          : row.path.text.split('/').pop()!
        const extension = '.' + fileNameWithExtension.split('.').pop()?.toLowerCase()

        const fileName = fileNameWithExtension.slice(0, -extension.length)

        let baseClipName = fileName

        // Check if file type is likely to be sequential and handle formatting.
        if (sequentialFileTypes.has(extension)) {
          const match = fileNameWithExtension.match(/^(.*?)(?:[._]\d+)?\.[a-zA-Z0-9]+$/)
          baseClipName = match ? match[1] : fileName
        }

        const md5 = isClassic ? row.md5 : row.md5?.text
        const sha1 = isClassic ? row.sha1 : row.sha1?.text
        const xxhash64 = isClassic ? row.xxhash64 : row.xxh64?.text
        const xxhash64be = isClassic ? row.xxhash64be : row.xxh64be?.text

        acc[baseClipName] = acc[baseClipName] || {
          clip: baseClipName,
          size: 0,
          copies: [{ path: path, hash: md5 || sha1 || xxhash64 || xxhash64be || null }]
        }

        // Sum the sizes
        const size = isClassic ? row.size : row.path.size
        acc[baseClipName].size += !isNaN(Number(size)) ? Number(size) : 0

        return acc
      },
      {} as Record<string, ClipType>
    )

    return Object.values(grouped) as ClipType[]
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Error processing file ${filePath}: ${err.message}`)
    }
    throw err
  }
}

async function readAndParseMHLFiles(
  filePaths: string[],
  path: string,
  progressCallback: (progress: number) => void
): Promise<ClipType[]> {
  let processedFiles = 0
  const updateProgress = (): void => {
    processedFiles++
    const progress = processedFiles / filePaths.length
    progressCallback(progress) // Report progress
  }

  const results: ClipType[][] = await Promise.all(
    filePaths.map(async (filePath) => {
      const result = await processFile(filePath, path, extensions, sequentialFileTypes)
      updateProgress()
      return result
    })
  )

  return results.flat() // Flatten the array of results
}

async function processMHL(mhlFiles: string[], path: string): Promise<ClipType[]> {
  let progress = 0
  let isCancelled = false
  let showProgressFlag = false

  const progressTimeout = setTimeout(() => {
    if (isCancelled) return
    showProgressFlag = true
    //mainWindow?.webContents.send('show-progress', 0)
  }, 100)

  const progressCallback = (updatedProgress: number): void => {
    progress = updatedProgress
    console.log(`Current Progress: ${progress * 100}%`)
    if (showProgressFlag) {
      //mainWindow?.setProgressBar(progress)
      //mainWindow?.webContents.send('show-progress', true, progress)
    }
  }

  try {
    //progressTimeout
    const data = await readAndParseMHLFiles(mhlFiles, path, progressCallback)
    //mainWindow.setProgressBar(-1) // Reset the progress bar
    //mainWindow.webContents.send('show-progress', false, -1)
    //clearTimeout(progressTimeout)
    return data
  } catch (error) {
    //clearTimeout(progressTimeout)
    console.error('Error processing MHL files:', error)
    throw error // or handle it as needed
  }
}

export default processMHL

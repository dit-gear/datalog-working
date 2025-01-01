import { dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { FileInfo } from './types'
import { ClipType, ResponseWithClips } from '@shared/datalogTypes'
import { getBuilderClips, setBuilderClips } from './builder-state'
import logger from '../../logger'
import { getProxyMetadata } from './utils/proxy-metadata'

const extensions = new Set(['.mov', '.mxf', '.mp4'])

const getProxys = async (directory: string, clips: ClipType[]): Promise<FileInfo[]> => {
  try {
    const files = fs.readdirSync(directory)

    const proxyPromises = files.map(async (file) => {
      const filePath = path.join(directory, file)
      const fileStats = fs.statSync(filePath)

      if (fileStats.isDirectory()) {
        return await getProxys(filePath, clips)
      }

      if (fileStats.isFile()) {
        const ext = path.extname(file).toLowerCase()

        if (extensions.has(ext)) {
          const filenameWithoutExt = path.basename(file, ext)
          const matchedClip = clips.find((clip) => clip.clip === filenameWithoutExt)

          if (matchedClip) {
            const { codec, resolution } = await getProxyMetadata(filePath)
            return {
              filename: filenameWithoutExt,
              size: fileStats.size,
              format: ext.slice(1).toUpperCase(),
              ...(codec && { codec }),
              ...(resolution && { resolution })
            }
          }
        }
      }
      return null
    })
    const proxies = await Promise.all(proxyPromises)
    return proxies.flat().filter((proxy): proxy is FileInfo => proxy !== null)
  } catch (error) {
    throw error
  }
}

const matchClips = (clips: ClipType[], proxies: FileInfo[], directory: string): ClipType[] => {
  return clips.map((clip) => {
    const matchedFile = proxies.find((proxy) => proxy.filename === clip.clip)

    if (matchedFile) {
      return {
        ...clip,
        proxy: {
          path: directory,
          ...(({ filename, ...rest }) => rest)(matchedFile)
        }
      }
    }
    return clip
  })
}

const addProxies = async (folderPath?: string): Promise<ResponseWithClips> => {
  try {
    if (!folderPath) {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })

      if (result.canceled) {
        return { success: false, error: 'User cancelled operation', cancelled: true }
      }
      folderPath = result.filePaths[0]
    }
    const clips = getBuilderClips()
    const proxys = await getProxys(folderPath, clips)
    if (proxys.length === 0) return { success: false, error: 'No Proxies could be found in folder' }

    const updatedClips = matchClips(clips, proxys, folderPath)

    setBuilderClips(updatedClips)

    return { success: true, clips: updatedClips }
  } catch (error) {
    const message = `Error while getting proxies: ${error instanceof Error ? error.message : 'unknown error'}`
    logger.error(message)
    return { success: false, error: message }
  }
}

export default addProxies

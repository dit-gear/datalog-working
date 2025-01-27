import fs from 'fs'
import path from 'path'
import type { OcfClipType, ProxyClipType, ResponseWithClips } from '@shared/datalogTypes'
import { getProxyMetadata } from '../../file-processing/proxies/proxy-metadata'

const extensions = new Set(['.mov', '.mxf', '.mp4'])

interface addProxyProps {
  paths: string
  storedClips: OcfClipType[]
}

const getProxys = async (
  directory: string,
  store: Map<string, OcfClipType>
): Promise<ProxyClipType[]> => {
  try {
    const files = fs.readdirSync(directory)

    const proxyPromises = files.map(async (file) => {
      const filePath = path.join(directory, file)
      const fileStats = fs.statSync(filePath)

      if (fileStats.isDirectory()) {
        return await getProxys(filePath, store)
      }

      if (fileStats.isFile()) {
        const ext = path.extname(file).toLowerCase()

        if (extensions.has(ext)) {
          const filenameWithoutExt = path.basename(file, ext)
          const matchedClip = store.get(filenameWithoutExt)

          if (matchedClip) {
            const { codec, resolution } = await getProxyMetadata(filePath)
            return {
              clip: filenameWithoutExt,
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
    return proxies.flat().filter((proxy): proxy is ProxyClipType => proxy !== null)
  } catch (error) {
    throw error
  }
}

const addProxy = async ({ paths, storedClips }: addProxyProps): Promise<ResponseWithClips> => {
  try {
    const directory = Array.isArray(paths) ? paths[0] : paths
    const store = new Map<string, OcfClipType>(storedClips.map((clip) => [clip.clip, clip]))
    const proxys = await getProxys(directory, store)
    if (proxys.length === 0) return { success: false, error: 'No matching proxies could be found' }

    return { success: true, clips: { proxy: proxys } }
  } catch (error) {
    const message = `Error while getting proxies: ${error instanceof Error ? error.message : 'unknown error'}`
    console.error(message)
    return { success: false, error: message }
  }
}

export default addProxy

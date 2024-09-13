import { dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { FileInfo } from './types'
import { ResponseWithClips } from '@shared/datalogTypes'

const getProxyFolderDetails = (dirPath: string): { folderSize: number; files: FileInfo[] } => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  let folderSize = 0
  const fileDetails: FileInfo[] = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const stats = fs.statSync(fullPath)

    if (entry.isDirectory()) {
      const subfolderDetails = getProxyFolderDetails(fullPath)
      folderSize += subfolderDetails.folderSize
      fileDetails.push(...subfolderDetails.files)
    } else if (entry.isFile()) {
      folderSize += stats.size
      fileDetails.push({
        filename: entry.name.split('.')[0],
        size: stats.size
      })
    }
  }

  return { folderSize, files: fileDetails }
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

    const { folderSize, files: fileDetails } = getProxyFolderDetails(folderPath)

    return { success: true, clips: [] }
  } catch (error) {
    const message = `Error while getting proxies: ${error instanceof Error ? error.message : 'unknown error'}`
    return { success: false, error: message }
  }
}

export default addProxies

import { shell } from 'electron'
import { Response } from '../../shared/shared-types'
import fs from 'fs'
import logger from '../core/logger'

export async function moveFileToTrash(filePath: string): Promise<Response> {
  return shell
    .trashItem(filePath)
    .then(() => {
      return { success: true }
    })
    .catch((error) => {
      return { success: false, error: (error as Error).message }
    })
}

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    logger.info(`Directory does not exist, creating directory: ${dirPath}`)
    fs.mkdirSync(dirPath)
    logger.info(`Directory created successfully: ${dirPath}`)
  }
}

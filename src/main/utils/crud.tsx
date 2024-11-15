import { shell } from 'electron'
import { Response } from '../../shared/shared-types'
import fs from 'fs/promises'
import logger from '../core/logger'
import Errorhandler from './Errorhandler'

export async function moveFileToTrash(filePath: string): Promise<Response> {
  try {
    await shell.trashItem(filePath)
    return { success: true }
  } catch (error) {
    return Errorhandler(error)
  }
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath) // Check if directory exists
  } catch {
    logger.debug(`Directory does not exist, attempting creating directory: ${dirPath}`)
    await fs.mkdir(dirPath, { recursive: true })
    logger.debug(`Directory created successfully: ${dirPath}`)
  }
}

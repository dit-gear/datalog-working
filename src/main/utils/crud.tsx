import { shell } from 'electron'
import { Response } from '../../shared/shared-types'
import fs from 'fs'
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

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    logger.info(`Directory does not exist, creating directory: ${dirPath}`)
    fs.mkdirSync(dirPath)
    logger.info(`Directory created successfully: ${dirPath}`)
  }
}

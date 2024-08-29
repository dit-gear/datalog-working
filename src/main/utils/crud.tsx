import { shell } from 'electron'
import { Response } from '../../shared/shared-types'
import fs from 'fs'

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
    fs.mkdirSync(dirPath)
  }
}

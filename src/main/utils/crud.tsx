import { shell } from 'electron'
import { Response } from '../../types'

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

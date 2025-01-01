import { getBuilderClips, setBuilderClips } from './builder-state'
import { ResponseWithClips } from '@shared/datalogTypes'
import logger from '../../logger'

const removeOcf = async (paths: string[]): Promise<ResponseWithClips> => {
  const clips = getBuilderClips()
  try {
    const pathSet = new Set(paths)
    const updatedClips = clips
      .map((clip) => {
        const filteredCopies = clip.copies.filter((copy) => !pathSet.has(copy.path))
        return {
          ...clip,
          copies: filteredCopies
        }
      })
      .filter((clip) => clip.copies.length > 0)

    setBuilderClips(updatedClips)
    return { success: true, clips: updatedClips }
  } catch (error) {
    const message = `Error while trying to remove path: ${error instanceof Error ? error.message : 'Unknown issue'}`
    logger.error(message)
    return { success: false, error: message }
  }
}

export default removeOcf

import { ResponseWithClips } from '@shared/datalogTypes'
import logger from '../../logger'

// Just remove them from the form.

/*
const removeProxies = async (): Promise<ResponseWithClips> => {
  const clips = getBuilderClips()
  try {
    const updatedClips = clips.map((clip) => {
      const { proxy, ...updatedClip } = clip
      return updatedClip
    })
    setBuilderClips(updatedClips)
    return { success: true, clips: updatedClips }
  } catch (error) {
    const message = `Error while getting proxies: ${error instanceof Error ? error.message : 'unknown error'}`
    logger.error(message)
    return { success: false, error: message }
  }
}

export default removeProxies
*/

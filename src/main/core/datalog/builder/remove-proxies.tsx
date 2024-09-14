import { getBuilderClips, setBuilderClips } from './builder-state'
import { ResponseWithClips } from '@shared/datalogTypes'
import logger from '../../logger'

const removeProxies = async (): Promise<ResponseWithClips> => {
  const clips = getBuilderClips()
  try {
    const updatedClips = clips.map((clip) => {
      const { Proxy, ...updatedClip } = clip
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

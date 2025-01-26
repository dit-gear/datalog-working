import addOCF from './add-ocf'
import addSound from './add-sound'
import addProxies from './add-proxies'
import { ResponseWithClips } from '@shared/datalogTypes'
import logger from '../../logger'

const addDefaults = async (paths: {
  ocf: string[] | null
  sound: string[] | null
  proxy: string | null
}): Promise<ResponseWithClips> => {
  try {
    const [ocfResult, soundResult] = await Promise.all([
      paths.ocf ? addOCF(paths.ocf) : null,
      paths.sound ? addSound(paths.sound) : null
    ])

    const proxyResult = paths.proxy ? await addProxies(paths.proxy) : null

    const clips: Record<string, any> = {}
    if (ocfResult?.success) {
      clips.ocf = ocfResult.clips.ocf
    } else if (ocfResult?.error) {
      throw new Error(ocfResult.error)
    }
    if (soundResult?.success) {
      clips.sound = soundResult.clips.sound
    } else if (soundResult?.error) {
      throw new Error(soundResult.error)
    }
    if (proxyResult?.success) {
      clips.proxy = proxyResult.clips.proxy
    } else if (proxyResult?.error) {
      throw new Error()
    }

    return {
      success: true,
      clips
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown'
    logger.error(error)
    return { success: false, error: message }
  }
}

export default addDefaults

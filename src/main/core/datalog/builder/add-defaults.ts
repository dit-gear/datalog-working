import { spawnWorker } from './workers/workerManager'
import { ResponseWithClips } from '@shared/datalogTypes'
import logger from '../../logger'

const addDefaults = async (paths: {
  ocf: string[] | null
  sound: string[] | null
  proxy: string | null
}): Promise<ResponseWithClips> => {
  let ocfResult: ResponseWithClips
  let soundResult: ResponseWithClips
  let proxyResult: ResponseWithClips | null = null

  try {
    const promises: Promise<void>[] = []
    // OCF worker
    if (paths.ocf) {
      const { promise } = spawnWorker('addOCFWorker', {
        paths: paths.ocf,
        storedClips: []
      })
      promises.push(
        promise.then((res: ResponseWithClips) => {
          ocfResult = res
        })
      )
    }

    // Sound worker
    if (paths.sound) {
      const { promise } = spawnWorker('addSoundWorker', {
        paths: paths.sound,
        storedClips: []
      })
      promises.push(
        promise.then((res: ResponseWithClips) => {
          soundResult = res
        })
      )
    }

    if (promises.length > 0) await Promise.all(promises)

    //@ts-ignore
    if (!ocfResult?.success) {
      //@ts-ignore
      throw new Error(ocfResult?.error ?? 'OCF error')
    }
    // Safely check Sound (if used)
    //@ts-ignore
    if (!soundResult?.success) {
      //@ts-ignore
      throw new Error(soundResult?.error ?? 'Sound error')
    }

    if (paths.proxy && ocfResult.success) {
      const { promise } = spawnWorker('addProxyWorker', {
        paths: paths.proxy,
        storedClips: ocfResult?.clips?.ocf ?? []
      })
      proxyResult = await promise
      if (!proxyResult.success) throw new Error(proxyResult.error)
    }

    const clips: Record<string, any> = {}
    //@ts-ignore
    if (ocfResult && ocfResult.success && ocfResult.clips.ocf) {
      //@ts-ignore
      clips.ocf = ocfResult.clips.ocf
    } //@ts-ignore
    if (soundResult && soundResult.success && soundResult.clips.sound) {
      //@ts-ignore
      clips.sound = soundResult.clips.sound
    }
    if (proxyResult && proxyResult.success && proxyResult.clips.proxy) {
      clips.proxy = proxyResult.clips.proxy
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

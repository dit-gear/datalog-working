// workerManager.ts
import { OcfClipType, ResponseWithClips, SoundClipType } from '@shared/datalogTypes'
import { Worker } from 'node:worker_threads'
import createAddOCFWorker from './addOCFWorker?modulePath'
import createAddSoundWorker from './addSoundWorker?modulePath'
import createAddProxyWorker from './addProxyWorker?modulePath'
import logger from '../../../logger'

interface WorkerInfo {
  worker: Worker
  resolve: (data: ResponseWithClips) => void
  reject: (err: Error) => void
}

const activeWorkers = new Map<string, WorkerInfo>()
let workerCounter = 0

const workerFactoryMap: Record<string, string> = {
  addOCFWorker: createAddOCFWorker,
  addSoundWorker: createAddSoundWorker,
  addProxyWorker: createAddProxyWorker
  // Add other mappings as needed
}

export function spawnWorker(
  scriptName: 'addOCFWorker' | 'addSoundWorker' | 'addProxyWorker' | 'addCustomWorker',
  payload: { paths: string | string[]; storedClips: OcfClipType[] | SoundClipType[] }
): { workerId: string; promise: Promise<ResponseWithClips> } {
  logger.debug(`Spawning worker: ${scriptName} with payload:`, payload)
  const createWorker = workerFactoryMap[scriptName]
  if (!createWorker) {
    throw new Error(`Unknown worker script: ${scriptName}`)
  }
  const workerId = `worker-${++workerCounter}`

  const promise = new Promise<ResponseWithClips>((resolve, reject) => {
    try {
      logger.debug(`Creating Worker with script: ${createWorker}`)
      const worker = new Worker(workerFactoryMap[scriptName], { workerData: payload })
      logger.debug(`Worker ${workerId} created successfully`)
      activeWorkers.set(workerId, { worker, resolve, reject })

      worker.once('message', (message: ResponseWithClips) => {
        logger.debug(`Worker ${workerId} sent message:`, message)
        resolve(message)
        cleanUpWorker(workerId)
      })

      worker.once('error', (err) => {
        logger.error(`Worker ${workerId} encountered error:`, err)
        reject(err)
        cleanUpWorker(workerId)
      })

      worker.once('exit', (code) => {
        logger.debug(`Worker ${workerId} exited with code: ${code}`)
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`))
        cleanUpWorker(workerId)
      })
    } catch (error) {
      logger.error(`Failed to create worker ${workerId}:`, error)
      reject(error)
      cleanUpWorker(workerId)
    }
  })

  return { workerId, promise }
}

export function cancelWorker(workerId: string) {
  const info = activeWorkers.get(workerId)
  if (info) {
    info.worker.terminate()
    info.reject(new Error('Operation cancelled.'))
    cleanUpWorker(workerId)
  }
}

function cleanUpWorker(workerId: string) {
  activeWorkers.delete(workerId)
}
//  const worker = new Worker(path.resolve(__dirname, scriptPath), { workerData: payload })

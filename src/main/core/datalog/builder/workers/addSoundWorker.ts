import { parentPort, workerData } from 'node:worker_threads'
import addSound from '../add-sound'

;(async () => {
  try {
    const result = await addSound(workerData)
    parentPort?.postMessage(result)
  } catch (error) {
    parentPort?.postMessage({ success: false, error: String(error) })
  }
})()

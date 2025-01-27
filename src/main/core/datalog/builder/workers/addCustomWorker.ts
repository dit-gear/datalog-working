import { parentPort, workerData } from 'node:worker_threads'
import addCustom from '../add-custom'
;(async () => {
  try {
    const result = await addCustom(workerData)
    parentPort?.postMessage(result)
  } catch (error) {
    parentPort?.postMessage({ success: false, error: String(error) })
  }
})()

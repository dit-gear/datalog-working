import { parentPort, workerData } from 'node:worker_threads'
import addOCF from '../add-ocf'
;(async () => {
  try {
    const result = await addOCF(workerData)
    parentPort?.postMessage(result)
  } catch (error) {
    parentPort?.postMessage({ success: false, error: String(error) })
  }
})()

import { parentPort, workerData } from 'node:worker_threads'
import addProxy from '../add-proxy'
;(async () => {
  try {
    const result = await addProxy(workerData)
    parentPort?.postMessage(result)
  } catch (error) {
    parentPort?.postMessage({ success: false, error: String(error) })
  }
})()

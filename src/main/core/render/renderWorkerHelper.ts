// renderWorkerHelper.ts
import { Worker } from 'worker_threads'
import renderWorkerPath from './renderWorker?modulePath'

export function createRenderWorker() {
  let worker: Worker | null = null

  function render({ id, code, type, dataObject }): Promise<{ html: string }> {
    if (!worker) {
      worker = new Worker(renderWorkerPath)
    }
    return new Promise((resolve, reject) => {
      worker?.postMessage({ id, code, type, dataObject })

      worker?.on('message', (result) => resolve(result))
      worker?.on('error', reject)
      worker?.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })
  }

  function terminate() {
    if (worker) {
      worker.terminate()
      worker = null
    }
  }
  return { render, terminate }
}
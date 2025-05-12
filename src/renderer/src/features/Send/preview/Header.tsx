import { useEffect, useRef, useCallback } from 'react'
import { useData } from '../utils/useData'
import Tabs from './Tabs'
import { DataObjectType } from '@shared/datalogClass'
import { PreviewWorkerRequest } from '@renderer/workers/utils/types'

export const Header = () => {
  const { data } = useData()
  const previewWorkerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const previewWorker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    previewWorkerRef.current = previewWorker

    previewWorker.onmessage = (e): void => {
      const msg = e.data
      if (msg.msgtype === 'read-files-base64') {
        const { id, base, paths } = msg
        // Fetch base64 for asset files from main via IPC
        window.sharedApi.readBase64Files(base, paths).then((data) => {
          previewWorker.postMessage({
            type: 'read-files-base64-response',
            id,
            data
          })
        })
        return
      }
      if (msg.msgtype === 'preview-update') {
        const previewEvent = new CustomEvent('preview-update', { detail: msg })
        window.dispatchEvent(previewEvent)
      }
    }

    return () => {
      previewWorker.terminate()
    }
  }, [])

  const sendToWorker = useCallback(
    (path: string, code: string, type: 'email' | 'pdf', message: string) => {
      try {
        if (!previewWorkerRef.current) throw new Error('Worker not initialized')
        if (!data) throw new Error('No project data available')

        const dataObject: DataObjectType = {
          project: data.project,
          message: message,
          datalog_selection: data.selection,
          datalog_all: data.datalogs
        }
        const request: PreviewWorkerRequest = {
          id: path,
          code: code,
          type: type,
          dataObject
        }

        previewWorkerRef.current.postMessage(request)
      } catch (error) {
        console.error('Error in sendMessageToWorker: ', error)
      }
    },
    [data]
  )

  return <Tabs sendToWorker={sendToWorker} />
}

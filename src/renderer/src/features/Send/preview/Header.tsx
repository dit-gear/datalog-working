import { useEffect, useRef, useCallback } from 'react'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'
import { useData } from '../utils/useData'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { fetchFileContent } from '../utils/fetchFileContent'
import Tabs from './Tabs'

export const Header = () => {
  //const { data } = useDataContext()
  const { data } = useData()
  const previewWorkerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const previewWorker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    previewWorkerRef.current = previewWorker

    previewWorker.onmessage = (e): void => {
      const { type, code, error } = e.data
      if (code) {
        console.log('from worker:', type, code, error)
        const previewEvent = new CustomEvent('preview-update', { detail: { type, code } })
        window.dispatchEvent(previewEvent)
      } else if (error) {
        console.log('error from worker')
        const errorEvent = new CustomEvent('preview-error', { detail: error })
        window.dispatchEvent(errorEvent)
      }
    }

    return () => {
      previewWorker.terminate()
    }
  }, [])

  const sendToWorker = useCallback(
    (code: string, type: 'email' | 'pdf', message: string) => {
      try {
        if (!previewWorkerRef.current) throw new Error('Worker not initialized')
        if (!data) throw new Error('No project data available')

        const request = {
          code: code,
          type: type,
          message: message,
          dataObject: {
            project: data.project,
            selection: data.selection,
            all: data.datalogs
          }
        }

        previewWorkerRef.current.postMessage(request)
      } catch (error) {
        console.error('Error in sendMessageToWorker: ', error)
      }
    },
    [data]
  )

  /* useEffect(() => {
    if (defaultSelectedEmail?.react && projectTemplates && data) {
      const template = getReactTemplate(defaultSelectedEmail.react, projectTemplates, 'email')
      if (template) {
        fetchFileContent(template.path).then((content) => {
          sendToWorker(content, 'email', '')
        })
      }
    }
  }, [projectTemplates, data, sendToWorker])*/

  return <Tabs sendToWorker={sendToWorker} />
}

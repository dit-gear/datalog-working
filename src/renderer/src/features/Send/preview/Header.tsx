import { useEffect, useRef, useCallback } from 'react'
import { useDataContext } from '../dataContext'
import { getReactTemplate } from '@shared/utils/getReactTemplate'
import { fetchFileContent } from '../utils/fetchFileContent'
import Tabs from './Tabs'

export const Header = () => {
  const { data, projectTemplates, defaultSelectedEmail } = useDataContext()
  const previewWorkerRef = useRef<Worker | null>(null)

  /*const codeStore = useRef<Map<string, string>>(new Map())

  const loadDefaultsInStore = async () => {
    const toStore = new Set<string>()
    if (defaultSelectedEmail?.react) {
      const email = getReactTemplate(defaultSelectedEmail.react, projectTemplates, 'email')
      email && toStore.add(email.path)
    }
    if (defaultSelectedEmail?.attachments) {
      const pdfobjects = getPdfAttachments(projectPdfs, defaultSelectedEmail.attachments)
      const pdfs = pdfobjects
        .map((item) => item.react)
        .filter((r): r is string => Boolean(r))
        .map((react) => getReactTemplate(react, projectTemplates, 'pdf'))
      pdfs.filter((pdf) => !!pdf).forEach((pdf) => toStore.add(pdf.path))
    }
    const files = await fetchMultipleFileContent([...toStore])
    Object.entries(files).forEach(([path, content]) => codeStore.current.set(path, content))
  }*/

  useEffect(() => {
    const previewWorker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    previewWorkerRef.current = previewWorker

    previewWorker.onmessage = (e): void => {
      const { id, type, code, error } = e.data
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
            all: data.all
          }
        }

        previewWorkerRef.current.postMessage(request)
      } catch (error) {
        console.error('Error in sendMessageToWorker: ', error)
      }
    },
    [data]
  )

  useEffect(() => {
    if (defaultSelectedEmail?.react && projectTemplates && data) {
      const template = getReactTemplate(defaultSelectedEmail.react, projectTemplates, 'email')
      if (template) {
        fetchFileContent(template.path).then((content) => {
          sendToWorker(content, 'email', '')
        })
      }
    }
  }, [defaultSelectedEmail, projectTemplates, data, sendToWorker])

  return <Tabs sendToWorker={sendToWorker} />
}

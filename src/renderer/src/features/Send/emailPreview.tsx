import { useEffect, useState, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import { getReactTemplate } from '@renderer/utils/getReactTemplate'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { useDataContext } from './dataContext'

export const EmailPreview = () => {
  const { projectTemplates, data } = useDataContext()
  const email = useWatch({ name: 'react' })
  const [error, setError] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const previewWorkerRef = useRef<Worker | null>(null)

  const fetchFileContent = async (email: TemplateDirectoryFile) => {
    try {
      const content = await window.sendApi.getFileContent(email.path)
      if (previewWorkerRef.current) {
        previewWorkerRef.current.postMessage({
          code: content,
          type: 'email',
          dataObject: data
        })
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (error) {
      setError(null)
    }
    if (email && projectTemplates) {
      const res = getReactTemplate(email, projectTemplates, 'email')
      res ? fetchFileContent(res) : setError(`${email} could not be found.`)
    }
  }, [email])

  useEffect(() => {
    const previewWorker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    previewWorkerRef.current = previewWorker

    previewWorker.onmessage = (e): void => {
      const { html, error } = e.data
      if (error) {
        console.error(error)
        setError(error)
      } else {
        setError(null)
        setPreviewContent(html)
      }
    }

    // Clean up the worker when the component unmounts
    return () => {
      previewWorker.terminate()
    }
  }, [])

  return (
    <div className="w-full h-full">
      {previewContent && !error && (
        <iframe id="iframe" className="w-full h-full" srcDoc={previewContent} />
      )}
      {error && (
        <div className="bg-red-100 p-8 text-black">
          <p>Error:</p>
          {error}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import { useWatch } from 'react-hook-form'

export const EmailPreview = () => {
  const email = useWatch({ name: 'reacttemplate' })
  const [error, setError] = useState(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const previewWorkerRef = useRef<Worker | null>(null)

  const fetchFileContent = async (email: string) => {
    try {
      const content = await window.send.getFileContent(email)
      if (previewWorkerRef.current) {
        previewWorkerRef.current.postMessage({ code: content, type: 'email' })
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (email && email !== 'plain-text') {
      fetchFileContent(email)
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
      {error && <div className="bg-red-100 p-8">{error}</div>}
    </div>
  )
}

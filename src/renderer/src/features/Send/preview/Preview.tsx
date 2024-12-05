import React, { useEffect, useState, useContext } from 'react'
import { useDataContext } from '../dataContext'
import { WorkerContext } from './PreviewContainer'
import { getReactTemplate } from '@renderer/utils/getReactTemplate'

interface PreviewProps {
  react: string
  type: 'email' | 'pdf'
}

export const Preview: React.FC<PreviewProps> = ({ react, type }) => {
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { projectTemplates, data } = useDataContext()
  const workerContext = useContext(WorkerContext)

  if (!workerContext) {
    throw new Error('WorkerContext is not available')
  }

  const { sendToWorker } = workerContext

  const fetchFileContent = async (path: string): Promise<string> => {
    try {
      const content = await window.sendApi.getFileContent(path)
      return content
    } catch (err: any) {
      throw new Error(`Failed to fetch file content: ${err.message}`)
    }
  }

  useEffect(() => {
    let isMounted = true
    setError(null)
    setPreviewContent(null)

    const generatePreview = async () => {
      try {
        const res = getReactTemplate(react, projectTemplates, type)
        if (!res) throw new Error('Could not find template')
        const content = await fetchFileContent(res.path)

        const result = await sendToWorker({
          type,
          code: content,
          dataObject: data
        })

        if (isMounted) {
          console.log(result.toString())
          setPreviewContent(result)
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(err)
          setError(err.message || 'An error occurred while generating the preview.')
        }
      }
    }

    generatePreview()

    return () => {
      isMounted = false
    }
  }, [react, type, data])

  return (
    <div className="w-full h-full bg-white">
      {previewContent && !error ? (
        <iframe
          className="w-full h-full"
          {...(type === 'pdf' ? { src: previewContent } : { srcDoc: previewContent })}
        />
      ) : error ? (
        <div className="bg-red-100 p-8 text-black">
          <p>Error:</p>
          {error}
        </div>
      ) : (
        <p>Loading preview...</p>
      )}
    </div>
  )
}

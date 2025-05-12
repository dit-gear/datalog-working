import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PreviewUpdate } from '@renderer/workers/utils/types'

const fallbackHtml = (msg: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Load Error</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f2f2f2;
      color: #333;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .error-card {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 400px;
      text-align: center;
    }
    .error-card h1 {
      margin-top: 0;
      font-size: 1.5rem;
      color: #e74c3c;
    }
    .error-card p {
      font-size: 1rem;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="error-card">
    <h1>Oops, something went wrong</h1>
    <p>${msg}</p>
  </div>
</body>
</html>`
}

export const Preview = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const loadingTimeoutRef = useRef<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currentFileRef = useRef<string | null>(null)

  useEffect(() => {
    window.addEventListener('preview-update', handlePreviewUpdate)
    window.addEventListener('preview-load', startLoading)

    return () => {
      window.removeEventListener('preview-update', handlePreviewUpdate)
      window.addEventListener('preview-load', startLoading)
    }
  }, [])

  const startLoading = () => {
    loadingTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(true)
    }, 500)
  }

  const handleUpdateIframe = (type, code) => {
    if (type === 'pdf') {
      if (iframeRef.current) {
        iframeRef.current?.removeAttribute('srcdoc')
        iframeRef.current.src = `${code}#toolbar=0`
      }
    } else {
      if (iframeRef.current) {
        iframeRef.current?.removeAttribute('src')
        iframeRef.current.srcdoc = code
      }
    }
  }

  const handlePreviewUpdate = (event: Event) => {
    const e = event as CustomEvent<PreviewUpdate>
    const data = e.detail

    if (!data.success) {
      setError(data.error)
      if (data.id !== currentFileRef.current) {
        handleUpdateIframe('email', fallbackHtml(data.error))
        currentFileRef.current = data.id
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      setIsLoading(false)
      return
    }
    const { id, type, code } = data

    setError(null)
    if (id !== currentFileRef.current) {
      currentFileRef.current = id
    }
    handleUpdateIframe(type, code)
  }

  const handleIframeLoad = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
    setIsLoading(false)
  }

  return (
    <div className="h-full rounded-md bg-white text-black">
      <div className="relative w-full h-full bg-white">
        {isLoading && (
          <div className="absolute top-0 left-0 z-20 w-full h-full bg-white/40 flex items-center justify-center z-30 fade-in">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          className={`absolute top-0 left-0 z-20 w-full h-full border-0`}
          onLoad={handleIframeLoad}
        />

        {error && (
          <div className="absolute bottom-10 left-10 z-30 bg-red-100 p-8 rounded-md">{error}</div>
        )}
      </div>
    </div>
  )
}
export default Preview

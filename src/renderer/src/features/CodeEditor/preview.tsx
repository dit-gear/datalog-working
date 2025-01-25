import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

export const Preview = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.addEventListener('preview-update', handlePreviewUpdate)
    window.addEventListener('preview-error', handlePreviewError)

    return () => {
      window.removeEventListener('preview-update', handlePreviewUpdate)
      window.removeEventListener('preview-error', handlePreviewError)
    }
  }, [])

  const handlePreviewUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<any>
    const { type, code } = customEvent.detail

    setIsLoading(true)
    setError(null)

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

  const handlePreviewError = (event: Event) => {
    const customEvent = event as CustomEvent<string>
    setError(customEvent.detail)
    setIsLoading(false)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="h-full rounded-md bg-white text-black">
      <div className="relative w-full h-full bg-white">
        {isLoading && (
          <div className="absolute top-0 left-0 z-20 w-full h-full bg-white/80 flex items-center justify-center z-30">
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

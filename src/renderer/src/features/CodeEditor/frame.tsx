import React, { useState, useEffect, useRef, useCallback } from 'react'

interface DoubleIframePDFProps {
  code: string // Existing Blob URL of the PDF
  type: 'email' | 'pdf' // Determines how the iframe should render content
}

const DoubleIframePDF: React.FC<DoubleIframePDFProps> = ({ code, type }) => {
  // State to hold src URLs for both iframes
  const [iframe1Src, setIframe1Src] = useState<string | null>(code)
  const [iframe2Src, setIframe2Src] = useState<string | null>(null)

  // State to track which iframe is currently visible (1 or 2)
  const [visibleIframe, setVisibleIframe] = useState<1 | 2>(1)

  // State to track errors
  const [error, setError] = useState<string | null>(null)

  // Refs for iframes to access DOM elements directly if needed
  const iframe1Ref = useRef<HTMLIFrameElement>(null)
  const iframe2Ref = useRef<HTMLIFrameElement>(null)

  // Ref to track which iframe is being loaded
  const loadingIframeRef = useRef<1 | 2 | null>(null)

  /**
   * Custom hook to debounce a function.
   * @param callback - Function to debounce.
   * @param delay - Delay in milliseconds.
   * @returns Debounced function.
   */
  const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<number | undefined>(undefined)

    const debouncedFunction = useCallback(
      (...args: any[]) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = window.setTimeout(() => {
          callback(...args)
        }, delay)
      },
      [callback, delay]
    )

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return debouncedFunction
  }

  /**
   * Function to update the hidden iframe with new PDF URL.
   * @param newUrl - The new PDF Blob URL.
   */
  const updateHiddenIframe = useCallback(
    (newUrl: string) => {
      setError(null)

      // Determine the hidden iframe
      const hiddenIframe = visibleIframe === 1 ? 2 : 1

      // Set loadingIframeRef to the hidden iframe
      loadingIframeRef.current = hiddenIframe

      // Update the src of the hidden iframe
      if (hiddenIframe === 1) {
        setIframe1Src(newUrl)
      } else {
        setIframe2Src(newUrl)
      }
    },
    [visibleIframe]
  )

  // Debounced version of updateHiddenIframe to prevent rapid updates
  const debouncedUpdateHiddenIframe = useDebounce(updateHiddenIframe, 100) // 300ms delay

  // Effect to handle changes in pdfUrl prop
  useEffect(() => {
    if (code && typeof code === 'string') {
      // Prevent redundant updates if the hidden iframe already has the new URL
      if (visibleIframe === 1 && iframe2Src === code) {
        return
      }
      if (visibleIframe === 2 && iframe1Src === code) {
        return
      }
      debouncedUpdateHiddenIframe(code)
    }
  }, [code, debouncedUpdateHiddenIframe, visibleIframe, iframe1Src, iframe2Src])

  /**
   * Handler when iframe1 finishes loading.
   */
  const handleIframe1Load = useCallback(() => {
    if (loadingIframeRef.current === 1) {
      setVisibleIframe(1)
      loadingIframeRef.current = null
    }
  }, [])

  /**
   * Handler when iframe2 finishes loading.
   */
  const handleIframe2Load = useCallback(() => {
    if (loadingIframeRef.current === 2) {
      setVisibleIframe(2)
      loadingIframeRef.current = null
    }
  }, [])

  /**
   * Handler for iframe1 loading errors.
   */
  const handleIframe1Error = useCallback(() => {
    if (loadingIframeRef.current === 1) {
      setError('Failed to load PDF in iframe 1. Please try again.')
      loadingIframeRef.current = null
    }
  }, [])

  /**
   * Handler for iframe2 loading errors.
   */
  const handleIframe2Error = useCallback(() => {
    if (loadingIframeRef.current === 2) {
      setError('Failed to load PDF in iframe 2. Please try again.')
      loadingIframeRef.current = null
    }
  }, [])

  /**
   * Handler to retry loading the PDF in case of an error.
   */
  const handleRetry = useCallback(() => {
    setError(null)
    if (visibleIframe === 1 && iframe2Src) {
      // Retry loading iframe2
      loadingIframeRef.current = 2
      setIframe2Src(iframe2Src)
    } else if (visibleIframe === 2 && iframe1Src) {
      // Retry loading iframe1
      loadingIframeRef.current = 1
      setIframe1Src(iframe1Src)
    }
  }, [visibleIframe, iframe1Src, iframe2Src])

  return (
    <div className="relative w-full h-full">
      {/* Iframe 1 */}
      <iframe
        ref={iframe1Ref}
        {...(type === 'pdf'
          ? { src: iframe1Src ? `${iframe1Src}#toolbar=0` : undefined }
          : { srcDoc: iframe1Src || undefined })}
        className={`absolute top-0 left-0 w-full h-full border-0 ${
          visibleIframe === 1
            ? 'opacity-100 z-20 pointer-events-auto '
            : 'opacity-0 z-10 pointer-events-none'
        }`}
        onLoad={handleIframe1Load}
        onError={handleIframe1Error}
        title="PDF Viewer 1"
      />

      {/* Iframe 2 */}
      <iframe
        ref={iframe2Ref}
        {...(type === 'pdf'
          ? { src: iframe2Src ? `${iframe2Src}#toolbar=0` : undefined }
          : { srcDoc: iframe2Src || undefined })}
        className={`absolute top-0 left-0 w-full h-full border-0 ${
          visibleIframe === 2
            ? 'opacity-100 z-20 pointer-events-auto '
            : 'opacity-0 z-10 pointer-events-none '
        }`}
        onLoad={handleIframe2Load}
        onError={handleIframe2Error}
        title="PDF Viewer 2"
      />

      {/* Error Message */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-700 text-white p-4 rounded shadow-lg z-30 text-center">
          <p>{error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-white text-red-700 rounded hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default DoubleIframePDF

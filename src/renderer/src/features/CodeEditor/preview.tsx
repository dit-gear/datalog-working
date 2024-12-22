import React from 'react'

export const Preview = () => {
  const handlePreviewLoaded = async () => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current) // Clear any existing timer
    }

    // Add a delay to ensure `iframe1` is completely rendered
    loadTimerRef.current = setTimeout(() => {
      isLoading && setIsLoading(false)
      setPreviousPreviewContent(previewContent)
    }, 300)
  }

  return (
    <div className="h-full rounded-md bg-white text-black">
      {/* Iframe 1 */}
      <div className="relative w-full h-full bg-white">
        {isLoading && (
          <div className="absolute top-0 left-0 z-20 w-full h-full bg-white/80 flex items-center justify-center z-30">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          </div>
        )}
        {previewContent ? (
          <iframe
            id="iframe1"
            key="iframe1"
            className={`absolute top-0 left-0 z-20 w-full h-full border-0 ${
              isLoading ? 'hidden' : 'block'
            }`}
            {...(previewContent.type === 'pdf'
              ? { src: `${previewContent.code}#toolbar=0` }
              : { srcDoc: previewContent.code })}
            onLoad={handlePreviewLoaded}
          />
        ) : (
          !isLoading && (
            <div className="absolute top-0 left-0 z-20 w-full h-full bg-white/80 flex items-center justify-center z-30">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </div>
          )
        )}
        {previousPreviewContent ? (
          <iframe
            id="iframe2"
            key="iframe2"
            className={`absolute top-0 left-0 z-10 w-full h-full border-0 ${
              isLoading ? 'block' : 'hidden'
            }`}
            {...(previousPreviewContent.type === 'pdf'
              ? { src: `${previousPreviewContent.code}#toolbar=0` }
              : { srcDoc: previousPreviewContent.code })}
          />
        ) : (
          <div className="absolute top-0 left-0 z-20 w-full h-full bg-white/80 flex items-center justify-center z-30">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute bottom-10 left-10 z-30 bg-red-100 p-8 rounded-md">{error}</div>
        )}
      </div>
    </div>
  )
}
export default Preview

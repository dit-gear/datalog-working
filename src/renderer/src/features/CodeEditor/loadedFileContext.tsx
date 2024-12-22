import React, { createContext, useContext, useState, useEffect } from 'react'
import { LoadedFile } from '@shared/shared-types'
import { handleApiResponse } from '@renderer/utils/handleApiResponse'

interface LoadedFileContextType {
  loadedFiles: LoadedFile[]
  addLoadedFile: (file: LoadedFile) => void
}

const LoadedFileContext = createContext<LoadedFileContextType | undefined>(undefined)

export const LoadedFileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([])
  //const { dir, loading } = useInitialDir()

  /*useEffect(() => {
    if (!loading && dir.length > 0 && !loadedFile) {
      const firstFile = dir.find((file) => file.type === 'email' || file.type === 'pdf')
      if (firstFile) {
        window.editorApi.requestReadFile(firstFile)
      }
    }
  }, [dir, loading, loadedFile])*/

  useEffect(() => {
    window.editorApi.onResponseReadFile((response) => {
      handleApiResponse(response, (newFile: LoadedFile) => {
        setLoadedFiles((prev) => {
          // If the file is already loaded, just replace/update it
          const existing = prev.findIndex((f) => f.path === newFile.path)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newFile
            return updated
          }
          // Otherwise, add it to the array
          return [...prev, newFile]
        })
      })
    })
  }, [])

  const addLoadedFile = (file: LoadedFile) => {
    setLoadedFiles((prev) => {
      const existing = prev.find((f) => f.path === file.path)
      if (existing) {
        // optional: either replace the file or do nothing
        return prev
      }
      return [...prev, file]
    })
  }

  return (
    <LoadedFileContext.Provider value={{ loadedFiles, addLoadedFile }}>
      {children}
    </LoadedFileContext.Provider>
  )
}

export const useLoadedFile = (): LoadedFileContextType => {
  const context = useContext(LoadedFileContext)
  if (!context) {
    throw new Error('useLoadedFile must be used within a LoadedFileProvider')
  }
  return context
}

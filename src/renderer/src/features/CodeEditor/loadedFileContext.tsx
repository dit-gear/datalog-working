/*import React, { createContext, useContext, useState, useEffect } from 'react'
import { LoadedFile } from '@shared/shared-types'
import { handleApiResponse } from '@renderer/utils/handleApiResponse'

interface ExtendedLoadedFile extends LoadedFile {
  isActive: boolean
  initialCode: string
  currentCode: string
}
interface LoadedFileContextType {
  loadedFiles: LoadedFile[]
  addLoadedFile: (file: LoadedFile) => void
  removeLoadedFile: (filePath: string) => void
  setActiveFile: (filePath: string) => void
}

const LoadedFileContext = createContext<LoadedFileContextType | undefined>(undefined)

export const LoadedFileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([])
 

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

  const removeLoadedFile = (file: LoadedFile) => {
    const prev = loadedFiles.find((v) => v.path !== file.path)
    setLoadedFiles(prev)
  }

  return (
    <LoadedFileContext.Provider value={{ loadedFiles, removeLoadedFile }}>
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
*/

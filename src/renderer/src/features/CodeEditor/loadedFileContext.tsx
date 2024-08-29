import React, { createContext, useContext, useState, useEffect } from 'react'
import useInitialDir from './useInitialDir'
import { LoadedFile } from '@shared/shared-types'

interface LoadedFileContextType {
  loadedFile: LoadedFile | null
  setLoadedFile: (file: LoadedFile | null) => void
}

const LoadedFileContext = createContext<LoadedFileContextType | undefined>(undefined)

export const LoadedFileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null)
  const { dir, loading } = useInitialDir()

  useEffect(() => {
    if (!loading && dir.length > 0 && !loadedFile) {
      const firstFile = dir.find((file) => file.type === 'email' || file.type === 'pdf')
      if (firstFile) {
        window.api.requestReadFile(firstFile)
      }
    }
  }, [dir, loading, loadedFile])

  return (
    <LoadedFileContext.Provider value={{ loadedFile, setLoadedFile }}>
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

import { useState, useEffect, ReactNode, createContext, useContext } from 'react'
import { InitialEditorData } from '@shared/shared-types'

type DataContextType = {
  initialData: InitialEditorData
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [initialData, setInitialData] = useState<InitialEditorData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInitialData = async (): Promise<void> => {
      try {
        const result = await window.editorApi.fetchInitialData()
        setInitialData(result)
      } catch (error) {
        setError('Failed to load initial data')
        console.error('Failed to fetch initial data:', error)
      } finally {
        setLoading(false)
        window.editorApi.showWindow()
      }
    }
    loadInitialData()
  }, [])

  if (loading) {
    return <div>Loading data...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!initialData) {
    return <div>No data found</div>
  }

  return <DataContext.Provider value={{ initialData }}>{children}</DataContext.Provider>
}

export const useInitialData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}

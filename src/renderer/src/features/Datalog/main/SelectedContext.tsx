import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'
import { DatalogType } from '@shared/datalogTypes'

type SelectedContextType = {
  selection?: DatalogType[]
  setSelection: Dispatch<SetStateAction<DatalogType[] | undefined>>
}

const SelectedContext = createContext<SelectedContextType | undefined>(undefined)

export const SelectedProvider = ({ children }: { children: ReactNode }) => {
  const [selection, setSelection] = useState<DatalogType[]>()

  return (
    <SelectedContext.Provider value={{ selection, setSelection }}>
      {children}
    </SelectedContext.Provider>
  )
}

export const useSelectedContext = () => {
  const context = useContext(SelectedContext)
  if (!context) {
    throw new Error('useSelectedContext must be used within a SelectedProvider')
  }
  return context
}

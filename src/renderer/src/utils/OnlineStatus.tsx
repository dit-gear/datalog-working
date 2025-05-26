import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const OnlineStatusContext = createContext<boolean>(true)

interface OnlineStatusProviderProps {
  children: ReactNode
}

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return <OnlineStatusContext.Provider value={isOnline}>{children}</OnlineStatusContext.Provider>
}

export const useOnlineStatus = (): boolean => {
  return useContext(OnlineStatusContext)
}

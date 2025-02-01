// renderer/hooks/useIpcNavigation.ts
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useIpcNavigation() {
  const navigate = useNavigate()

  useEffect(() => {
    window.mainApi.openBuilder(() => {
      navigate('/builder')
    })
    window.mainApi.openSettings(() => {
      navigate('/settings')
    })
  }, [navigate])
}

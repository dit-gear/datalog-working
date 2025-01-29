// renderer/hooks/useIpcNavigation.ts
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useIpcNavigation() {
  const navigate = useNavigate()

  useEffect(() => {
    //do nothing
    /*
    window.mainApi.onNavigateToBuilder((logId?: string) => {
      if (logId) navigate(`/builder/${logId}`)
      else navigate('/builder')
    })
    window.mainApi.onNavigateToSettings(() => {
      navigate('/settings')
    })*/
  }, [navigate])
}

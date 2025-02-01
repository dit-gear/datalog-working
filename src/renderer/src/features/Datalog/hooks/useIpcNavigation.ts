// renderer/hooks/useIpcNavigation.ts
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useIpcNavigation() {
  const navigate = useNavigate()

  useEffect(() => {
    const builderCallback = () => navigate('/builder')
    const settingsCallback = () => navigate('/settings')
    const newProjectCallback = () => navigate('/new-project')

    window.mainApi.openBuilder(builderCallback)
    window.mainApi.openSettings(settingsCallback)
    window.mainApi.openNewProject(newProjectCallback)
    return () => {
      window.mainApi.removeOpenBuilder(builderCallback)
      window.mainApi.removeOpenSettings(settingsCallback)
      window.mainApi.removeOpenNewProject(newProjectCallback)
    }
  }, [navigate])
}

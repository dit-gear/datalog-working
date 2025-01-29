// hooks/useIpcListeners.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ProjectType } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'

export function useIpcListeners() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleProjectLoaded = (project: ProjectType) => {
      // Update the "project" query data
      queryClient.setQueryData(['project'], project)
    }

    window.mainApi.onProjectLoaded(handleProjectLoaded)

    return () => {
      // If your Electron preload supports "off" calls, remove the listener here
      // window.mainApi.offProjectLoaded(handleProjectLoaded)
    }
  }, [queryClient])

  useEffect(() => {
    const handleDatalogsLoaded = (datalogs: DatalogType[]) => {
      // Update the "datalogs" query data
      queryClient.setQueryData(['datalogs'], datalogs)
    }

    window.mainApi.onDatalogsLoaded(handleDatalogsLoaded)

    return () => {
      // window.mainApi.offDatalogsLoaded(handleDatalogsLoaded)
    }
  }, [queryClient])
}

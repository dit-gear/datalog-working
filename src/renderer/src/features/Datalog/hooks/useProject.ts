import { useQuery } from '@tanstack/react-query'
import { ProjectType } from '@shared/projectTypes'

async function fetchProject() {
  return window.mainApi.getProject() // your existing IPC call
}

export function useProject() {
  return useQuery<ProjectType | undefined>({
    queryKey: ['project'],
    queryFn: fetchProject
  })
}

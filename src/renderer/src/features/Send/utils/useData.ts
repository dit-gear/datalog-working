import { useQuery } from '@tanstack/react-query'
import { InitialSendData } from '@shared/shared-types'

async function fetchInitialData() {
  return window.sendApi.fetchInitialData()
}

export function useData() {
  return useQuery<InitialSendData>({
    queryKey: ['data'],
    queryFn: fetchInitialData
  })
}

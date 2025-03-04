import { useQuery } from '@tanstack/react-query'
import { InitialSendData } from '@shared/shared-types'
import { getLatestDatalog } from '@shared/utils/getLatestDatalog'

async function fetchInitialData() {
  return window.sendApi.fetchInitialData()
}

export function useData() {
  return useQuery<InitialSendData>({
    queryKey: ['data'],
    queryFn: fetchInitialData,
    select: (data) => ({
      ...data,
      selection: data.selection ?? getLatestDatalog(data.datalogs, data.project)
    })
  })
}

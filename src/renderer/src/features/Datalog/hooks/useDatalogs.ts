import { useQuery } from '@tanstack/react-query'
import { DatalogType } from '@shared/datalogTypes'

async function fetchDatalogs() {
  return window.mainApi.getDatalogs() // your existing IPC call
}

export function useDatalogs() {
  return useQuery<DatalogType[]>({
    queryKey: ['datalogs'],
    queryFn: fetchDatalogs,
    initialData: []
  })
}

import { useQuery } from '@tanstack/react-query'

async function fetchEmailApi(): Promise<boolean> {
  return window.sharedApi.checkEmailApiConfigExists() // your existing IPC call
}

export function useEmailApi() {
  return useQuery<boolean>({
    queryKey: ['emailApi'],
    queryFn: fetchEmailApi
  })
}

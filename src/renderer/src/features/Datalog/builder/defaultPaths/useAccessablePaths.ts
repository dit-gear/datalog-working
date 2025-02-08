import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { CheckPathsResult, DefaultPathsInput } from '@shared/shared-types'

async function fetchInitialCheckedPaths(paths: DefaultPathsInput) {
  return await window.mainApi.checkDefaultPaths(paths)
}

export function useAccessablePaths(
  paths: DefaultPathsInput,
  options?: Omit<
    UseQueryOptions<CheckPathsResult, Error, CheckPathsResult, [string]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<CheckPathsResult, Error, CheckPathsResult, [string]>({
    queryKey: ['defaultPaths'],
    queryFn: () => fetchInitialCheckedPaths(paths),
    refetchInterval: 5000,
    ...options
  })
}

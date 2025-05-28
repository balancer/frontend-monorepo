import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

export const testQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent vitest from garbage collecting cache
        gcTime: Infinity,

        // Turn off retries to prevent timeouts
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: e => {
        console.error('Error in query:', e)
      },
    }),
    mutationCache: new MutationCache({
      onError: e => {
        console.error('Error in mutation:', e)
      },
    }),
  })

export function aSuccessfulQueryResultMock() {
  return {
    status: 'success',
    isLoading: false,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isRefetching: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as const
}

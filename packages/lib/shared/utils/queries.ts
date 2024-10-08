import { UseQueryResult } from '@tanstack/react-query'

/*
  When you only want a query to refetch when the key changes or refetch is explicitly called.

  Why no background refetches?  Example where background refetches can be harmful:
    Polygon:
    1. The user is waiting for a Tx confirmation and goes to another tab
    2. The tx is confirmed but has less than minConfirmations
    3. The user comes back to balancer tab, which triggers a background react-query for the simulation (only if staleTime: 0)
    5. The new simulation background query fails cause the tx is already confirmed (we get misleading sentry errors cause there was not a real error)
    6. The tx reaches > minConfirmations so the flow can be finished successfully (however, point 5. can temporarily alter the UI and send wrong Sentry logs)

  Setting refetchOnWindowFocus to false will avoid background refetches like the ones in the previous example.

  More info:
  https://tanstack.com/query/v5/docs/framework/react/guides/window-focus-refetching
  https://tkdodo.eu/blog/practical-react-query
*/
export const onlyExplicitRefetch = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}

export function isLoadingQueries(...queries: Pick<UseQueryResult, 'isLoading'>[]): boolean {
  return queries.some(query => query.isLoading)
}

export function isRefetchingQueries(...queries: Pick<UseQueryResult, 'isRefetching'>[]): boolean {
  return queries.some(query => query.isRefetching)
}

export function refetchQueries(...queries: Pick<UseQueryResult, 'isFetched' | 'refetch'>[]) {
  return Promise.all(queries.map(query => query.refetch()))
}

export const defaultDebounceMs = 300 // milliseconds

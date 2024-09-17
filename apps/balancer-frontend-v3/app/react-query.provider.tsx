'use client'

import { isDev } from '@/lib/config/app.config'
import { captureError } from '@/lib/shared/utils/errors'
import { SentryMetadata, captureSentryError, shouldIgnore } from '@/lib/shared/utils/query-errors'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Global handler for every react-query error
    onError: (error, query) => {
      if (shouldIgnore(error.message, error.stack)) return
      console.log('Sentry capturing query error: ', {
        meta: query?.meta,
        error,
        queryKey: query.queryKey,
      })

      if (query?.meta) return captureSentryError(error, query?.meta as SentryMetadata)

      // Unexpected error in query (as expected errors should have query.meta)
      captureError(error, { extra: { queryKey: query.queryKey } })
    },
  }),
  mutationCache: new MutationCache({
    // Global handler for every react-query mutation error (i.e. useSendTransaction)
    onError: (error, variables, _context, mutation) => {
      if (shouldIgnore(error.message, error.stack)) return
      console.log('Sentry capturing mutation error: ', {
        meta: mutation?.meta,
        error,
        variables,
      })

      if (mutation?.meta) return captureSentryError(error, mutation?.meta as SentryMetadata)

      // Unexpected error in mutation (as expected errors should have query.meta)
      captureError(error, { extra: { variables: variables } })
    },
  }),
})

export function ReactQueryClientProvider({ children }: { children: ReactNode | ReactNode[] }) {
  const shouldShowReactQueryDevtools = false
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDev && shouldShowReactQueryDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}

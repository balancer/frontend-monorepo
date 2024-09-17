'use client'

import { isDev } from '@/lib/config/app.config'
import { captureError, getTenderlyUrlFromErrorMessage } from '@/lib/shared/utils/errors'
import {
  SentryMetadata,
  captureSentryError,
  getTenderlyUrl,
  shouldIgnore,
} from '@/lib/shared/utils/query-errors'
import { ScopeContext } from '@sentry/types'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Global handler for every react-query error
    onError: (error, query) => {
      const queryMeta = query?.meta
      if (shouldIgnore(error.message, error.stack)) return
      console.log('Sentry capturing query error', {
        meta: queryMeta,
        error,
        queryKey: query.queryKey,
      })

      const sentryContext = query?.meta?.context as ScopeContext
      if (sentryContext?.extra && !getTenderlyUrl(sentryContext.extra)) {
        sentryContext.extra.tenderlyUrl = getTenderlyUrlFromErrorMessage(error, queryMeta)
      }

      if (queryMeta) return captureSentryError(error, queryMeta as SentryMetadata)

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
      {isDev && shouldShowReactQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

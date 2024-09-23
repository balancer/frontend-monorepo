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
      const sentryMeta = query?.meta as SentryMetadata
      if (shouldIgnore(error.message, error.stack)) return
      console.log('Sentry capturing query error', {
        meta: sentryMeta,
        error,
        queryKey: query.queryKey,
      })

      const sentryContext = sentryMeta?.context as ScopeContext
      if (sentryContext?.extra && !getTenderlyUrl(sentryMeta)) {
        sentryContext.extra.tenderlyUrl = getTenderlyUrlFromErrorMessage(error, sentryMeta)
      }

      if (sentryMeta) return captureSentryError(error, sentryMeta as SentryMetadata)

      // Unexpected error in query (as expected errors should have query.meta)
      captureError(error, { extra: { queryKey: query.queryKey } })
    },
  }),
  mutationCache: new MutationCache({
    // Global handler for every react-query mutation error (i.e. useSendTransaction)
    onError: (error, variables, _context, mutation) => {
      const mutationMeta = mutation?.meta as SentryMetadata
      if (shouldIgnore(error.message, error.stack)) return
      console.log('Sentry capturing mutation error: ', {
        meta: mutation?.meta,
        error,
        variables,
      })

      if (mutationMeta) return captureSentryError(error, mutationMeta)

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

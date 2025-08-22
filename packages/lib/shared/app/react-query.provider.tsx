'use client'

import { isDev } from '../../config/app.config'
import { captureError, getTenderlyUrlFromErrorMessage } from '../utils/errors'
import {
  SentryMetadata,
  captureSentryError,
  getTenderlyUrl,
  shouldIgnore,
} from '../utils/query-errors'
import { ScopeContext } from '@sentry/core'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'
import { isPoolSurgingError } from '../utils/error-filters'
import { BaseError, decodeErrorResult } from 'viem'
import {
  balancerBatchRouterAbiExtended,
  balancerCompositeLiquidityRouterBoostedAbiExtended,
  balancerCompositeLiquidityRouterNestedAbiExtended,
  balancerRouterAbiExtended,
} from '@balancer/sdk'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Global handler for every react-query error
    onError: (error, query) => {
      const sentryMeta = query?.meta as SentryMetadata
      if (shouldIgnore(error.message, error.stack)) return
      if (shouldIgnoreEdgeCaseError(error, sentryMeta)) return

      console.log('Sentry capturing query error', {
        meta: sentryMeta,
        error,
        queryKey: query.queryKey,
      })
      if (error.message.includes('unknown reason')) {
        console.log('Decoded reason: ', decodeError(error))
      }

      const sentryContext = sentryMeta?.context as ScopeContext
      if (sentryContext?.extra && !getTenderlyUrl(sentryMeta)) {
        sentryContext.extra.tenderlyUrl = getTenderlyUrlFromErrorMessage(error, sentryMeta)
      }

      if (sentryMeta) {
        return captureSentryError(error, sentryMeta as SentryMetadata)
      }

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

type InternalErrorType = {
  data: string
}

// This ABI is constructed as an aggregate of multiple ABIs using the same technique as
// https://github.com/balancer/b-sdk/blob/797540471ad486e4789ee54d4ea47a9833479c39/src/abi/index.ts#L55
// More ABIs could be added but bear in mind that it would make the probability of collisions
// higher (as a workaround we could always comment those not used when debugging)
const megazordBalancerAbi = [
  ...balancerRouterAbiExtended,
  ...balancerBatchRouterAbiExtended,
  ...balancerCompositeLiquidityRouterBoostedAbiExtended,
  ...balancerCompositeLiquidityRouterNestedAbiExtended,
]

function decodeError(e: Error) {
  const internalError = (e as BaseError).walk() as unknown
  const internalErrorData = (internalError as InternalErrorType).data as `0x${string}`

  if (internalErrorData === '0x') return 'Unable to find underlying reason'

  return decodeErrorResult({
    abi: megazordBalancerAbi,
    data: internalErrorData,
  })
}

export function ReactQueryClientProvider({ children }: { children: ReactNode | ReactNode[] }) {
  const shouldShowReactQueryDevtools = false
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDev && shouldShowReactQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

/*
  There are some edge cases where we need to parse specific sentry metadata params
 */
function shouldIgnoreEdgeCaseError(error: Error, sentryMeta: SentryMetadata): boolean {
  const metaParams = sentryMeta?.context?.extra?.params as Record<string, any>
  const hasStableSurgeHook = metaParams?.hasStableSurgeHook
  if (isPoolSurgingError(error.message, hasStableSurgeHook)) return true
  return false
}

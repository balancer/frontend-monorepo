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
import { isPoolSurgingError, isSwapWithNoPathsError } from '../utils/error-filters'
import { SimulateSwapInputs } from '@repo/lib/modules/swap/swap.types'
import { sendMessage } from '../services/slack/api'

// ABI and viem imports deferred to reduce initial bundle size
// Only loaded when decoding swap errors (rare case)

type SwapParams = {
  chainId: number
  swapInputs: SimulateSwapInputs
}

const SLACK_CHANNEL_ID = 'C0ADASX2SSH'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Global handler for every react-query error
    onError: (error, query) => {
      const sentryMeta = query?.meta as SentryMetadata
      if (shouldIgnore(error.message, error.stack)) return
      if (shouldIgnoreEdgeCaseError(error, sentryMeta)) return
      if (isSwapWithNoPathsError(error.message) && sentryMeta.context?.extra) {
        const params = sentryMeta.context?.extra['params'] as SwapParams
        sendMessage(
          SLACK_CHANNEL_ID,
          `chain: ${params.chainId}\n` +
            `tokenIn: ${params.swapInputs.tokenIn}\n` +
            `tokenOut: ${params.swapInputs.tokenOut}\n` +
            `swapKind: ${params.swapInputs.swapType}\n` +
            `swapAmount: ${params.swapInputs.swapAmount}`
        )

        return
      }

      console.log('Sentry capturing query error', {
        meta: sentryMeta,
        error,
        queryKey: query.queryKey,
      })
      if (error.message.includes('unknown reason') || error.message.includes('custom error')) {
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

async function decodeError(e: Error) {
  const { BaseError, decodeErrorResult } = await import('viem')
  const {
    balancerBatchRouterAbiExtended,
    balancerCompositeLiquidityRouterBoostedAbiExtended,
    balancerCompositeLiquidityRouterNestedAbiExtended,
    balancerRouterAbiExtended,
  } = await import('@balancer/sdk')

  const megazordBalancerAbi = [
    ...balancerRouterAbiExtended,
    ...balancerBatchRouterAbiExtended,
    ...balancerCompositeLiquidityRouterBoostedAbiExtended,
    ...balancerCompositeLiquidityRouterNestedAbiExtended,
  ]

  const internalError = (e as unknown as { walk: () => unknown }).walk() as unknown
  const internalErrorData = (internalError as { data: string }).data as `0x${string}`

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
  const hasSurgeHook = metaParams?.hasSurgeHook
  if (isPoolSurgingError(error.message, hasSurgeHook)) return true
  return false
}

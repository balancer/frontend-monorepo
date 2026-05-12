'use client'

import { useQuery } from '@apollo/client/react'
import {
  GetPoolEventsDocument,
  GqlChain,
  GqlPoolEventType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export type LiveSwap = {
  id: string
  chain: GqlChain
  tokenInAddress: string
  tokenOutAddress: string
  tokenInAmount: string
  tokenOutAmount: string
  poolId: string
  tx: string
  usdValue: number
  timestamp: number
  relativeTime: string
}

function relativeTime(unixSec: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSec
  if (diff < 60) return `${Math.max(diff, 0)}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

/**
 * Recent SWAP events across all supported chains via api-v3 `poolEvents`.
 * Polls every 30s — the api-v3 doesn't ship a subscription, and 30s matches
 * the cadence the protocol stats provider already uses for cache refresh.
 *
 * Symbol enrichment (address → ticker) is handled in the rendering component
 * via `useTokenSymbols` so this hook stays a thin pass-through.
 */
export function useLiveSwaps({ limit = 10 }: { limit?: number } = {}) {
  const { data, loading } = useQuery(GetPoolEventsDocument, {
    variables: {
      first: limit,
      skip: 0,
      chainIn: PROJECT_CONFIG.supportedNetworks,
      type: GqlPoolEventType.Swap,
    },
    pollInterval: 30_000,
  })

  const items: LiveSwap[] = (data?.poolEvents ?? []).flatMap(e => {
    if (e.__typename !== 'GqlPoolSwapEventV3' && e.__typename !== 'GqlPoolSwapEventCowAmm') {
      return []
    }
    return [
      {
        id: e.id,
        chain: e.chain,
        tokenInAddress: e.tokenIn?.address ?? '',
        tokenOutAddress: e.tokenOut?.address ?? '',
        tokenInAmount: e.tokenIn?.amount ?? '0',
        tokenOutAmount: e.tokenOut?.amount ?? '0',
        poolId: e.poolId,
        tx: e.tx,
        usdValue: e.valueUSD,
        timestamp: e.timestamp,
        relativeTime: relativeTime(e.timestamp),
      },
    ]
  })

  return { items, loading }
}

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
  tokenIn: string
  tokenOut: string
  poolName: string
  usdValue: number
  relativeTime: string
}

function shortAddress(addr: string | undefined | null): string {
  if (!addr) return '?'
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
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
 * Token labels render as shortened addresses (`0x6b3f…d6e1`); a future
 * iteration can join with `tokenGetTokens` for symbols. valueUSD is
 * authoritative — that's what api-v3 computes server-side.
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
        tokenIn: shortAddress(e.tokenIn?.address),
        tokenOut: shortAddress(e.tokenOut?.address),
        poolName: shortAddress(e.poolId),
        usdValue: e.valueUSD,
        relativeTime: relativeTime(e.timestamp),
      },
    ]
  })

  return { items, loading }
}

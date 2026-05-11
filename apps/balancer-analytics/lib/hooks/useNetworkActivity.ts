'use client'

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useEffect, useMemo, useState } from 'react'
import { getV3VaultClient } from '../services/subgraph/client'
import { getV3VaultSupportedChains } from '../services/subgraph/endpoints'
import { GetRecentActivityDocument } from '../generated/v3-vault/graphql'

export type ChainActivity = {
  chain: GqlChain
  swapCount: number
  addRemoveCount: number
  total: number
}

type State = {
  data: ChainActivity[]
  loading: boolean
  error: Error | null
}

const SECS_PER_DAY = 86_400
const MAX_PER_QUERY = 1000

/**
 * Counts swaps + adds/removes in the last 24h per chain (v3-vault subgraph).
 *
 * Subgraphs cap result sets at 1000, so a chain reporting `swapCount=1000` is
 * a floor — we surface this as a `+` suffix in the UI. For higher fidelity we
 * would need to paginate by `blockTimestamp` cursor, which is not worth it
 * for a quick "is the network alive" widget.
 */
export function useNetworkActivity() {
  const chains = useMemo(() => getV3VaultSupportedChains(), [])
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    const since = String(Math.floor(Date.now() / 1000) - SECS_PER_DAY)

    async function run() {
      setState(s => ({ ...s, loading: true, error: null }))
      try {
        const results = await Promise.all(
          chains.map(async chain => {
            const client = getV3VaultClient(chain)
            if (!client) return null
            const r = await client.query({
              query: GetRecentActivityDocument,
              variables: { since, first: MAX_PER_QUERY },
              fetchPolicy: 'cache-first',
            })
            return {
              chain,
              swapCount: r.data?.swaps.length ?? 0,
              addRemoveCount: r.data?.addRemoves.length ?? 0,
              total: (r.data?.swaps.length ?? 0) + (r.data?.addRemoves.length ?? 0),
            }
          })
        )
        if (cancelled) return
        const data = results
          .filter((r): r is ChainActivity => r !== null)
          .sort((a, b) => b.total - a.total)
        setState({ data, loading: false, error: null })
      } catch (err) {
        if (cancelled) return
        setState({ data: [], loading: false, error: err as Error })
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [chains])

  return state
}

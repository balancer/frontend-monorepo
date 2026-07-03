'use client'

import { useApolloClient } from '@apollo/client/react'
import {
  GetProtocolStatsPerChainDocument,
  GetProtocolStatsPerChainQuery,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { useEffect, useMemo, useState } from 'react'

export type ChainStat = GetProtocolStatsPerChainQuery['protocolMetricsChain'] & {
  chain: GqlChain
}

type State = {
  data: ChainStat[]
  loading: boolean
  error: Error | null
}

/**
 * Fans out GetProtocolStatsPerChain across all supported networks in parallel.
 * api-v3 has no protocol-level cross-chain time series, so we issue one query
 * per chain and aggregate client-side. Each query is independently cached by
 * Apollo, so subsequent renders reuse results without refetching.
 */
export function useChainProtocolStats() {
  const client = useApolloClient()
  const chains = useMemo(() => PROJECT_CONFIG.supportedNetworks, [])
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false

    async function run() {
      setState(s => ({ ...s, loading: true, error: null }))
      try {
        const results = await Promise.all(
          chains.map(chain =>
            client
              .query({
                query: GetProtocolStatsPerChainDocument,
                variables: { chain },
                fetchPolicy: 'cache-first',
              })
              .then(r => ({ chain, metrics: r.data?.protocolMetricsChain }))
          )
        )
        if (cancelled) return
        const data = results
          .filter((r): r is { chain: GqlChain; metrics: NonNullable<typeof r.metrics> } =>
            Boolean(r.metrics)
          )
          .map(r => ({ ...r.metrics, chain: r.chain }))
          .sort((a, b) => Number(b.totalLiquidity) - Number(a.totalLiquidity))
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
  }, [client, chains])

  return state
}

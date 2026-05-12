'use client'

import { useQuery } from '@apollo/client/react'
import {
  GetTokensDocument,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { useMemo } from 'react'

export type TokenSymbolEntry = {
  symbol: string | null
  decimals: number | null
  logoURI: string | null
}

export type TokenSymbolLookup = (chain: GqlChain, address: string) => TokenSymbolEntry | undefined

/**
 * Loads the token universe for every supported chain once and exposes a
 * `(chain, address) => { symbol, ... }` lookup. Backed by Apollo's normalized
 * cache so this is effectively a single network request shared across all
 * consumers.
 */
export function useTokenSymbols() {
  const { data, loading } = useQuery(GetTokensDocument, {
    variables: { chains: PROJECT_CONFIG.supportedNetworks },
    fetchPolicy: 'cache-first',
  })

  const map = useMemo(() => {
    const m = new Map<string, TokenSymbolEntry>()
    for (const t of data?.tokens ?? []) {
      const key = `${t.chain}:${t.address.toLowerCase()}`
      m.set(key, { symbol: t.symbol, decimals: t.decimals, logoURI: t.logoURI ?? null })
    }
    return m
  }, [data])

  const lookup: TokenSymbolLookup = useMemo(
    () => (chain, address) => map.get(`${chain}:${address.toLowerCase()}`),
    [map]
  )

  return { lookup, loading }
}

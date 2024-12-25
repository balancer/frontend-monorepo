/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import {
  GetFeaturedPoolsQuery,
  GetPoolDocument,
  GetPoolQuery,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { createContext, PropsWithChildren, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { FetchPoolProps } from './pool.types'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { getPoolHelpers } from './pool.helpers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { usePoolEnrichWithOnChainData } from './queries/usePoolEnrichWithOnChainData'
import { useOnchainUserPoolBalances } from './queries/useOnchainUserPoolBalances'
import { useInvalidVariantRedirect } from './pool.hooks'
import { getPoolDisplayTokens } from './pool.utils'
import { useTokens } from '../tokens/TokensProvider'

export type Pool = GetPoolQuery['pool']
export type FeaturedPool = GetFeaturedPoolsQuery['featuredPools'][0]['pool']
export type UsePoolResponse = ReturnType<typeof _usePool> & {
  chain: GqlChain
}

export const PoolContext = createContext<UsePoolResponse | null>(null)

export function _usePool({
  id,
  chain,
  initialData,
}: FetchPoolProps & { initialData: GetPoolQuery }) {
  const { userAddress } = useUserAccount()
  const { priceFor, calcTotalUsdValue } = useTokens()
  const myLiquiditySectionRef = useRef<HTMLDivElement | null>(null)

  useInvalidVariantRedirect(initialData.pool)

  const { data } = useQuery(GetPoolDocument, {
    variables: { id, chain, userAddress: userAddress.toLowerCase() },
  })

  const {
    pool: poolWithOnChainData,
    refetch: refetchOnchainData,
    isLoading: isLoadingOnchainData,
  } = usePoolEnrichWithOnChainData(data?.pool || initialData.pool)

  const {
    data: [poolWithOnchainUserBalances],
    refetch: refetchOnchainUserBalances,
    isLoading: isLoadingOnchainUserBalances,
  } = useOnchainUserPoolBalances([poolWithOnChainData || data?.pool || initialData.pool])

  const pool = poolWithOnchainUserBalances || poolWithOnChainData || data?.pool || initialData.pool
  const bptPrice = priceFor(pool.address, pool.chain)
  const tvl = calcTotalUsdValue(getPoolDisplayTokens(pool), pool.chain)
  const isLoading = isLoadingOnchainData || isLoadingOnchainUserBalances

  const refetch = async () => {
    return Promise.all([refetchOnchainData(), refetchOnchainUserBalances()])
  }

  return {
    pool,
    bptPrice,
    tvl,
    isLoading,
    isLoadingOnchainData,
    isLoadingOnchainUserBalances,
    myLiquiditySectionRef,
    // TODO: we assume here that we never need to reload the entire pool.
    // this assumption may need to be questioned
    refetch,
    ...getPoolHelpers(pool, chain),
  }
}

export function PoolProvider({
  id,
  chain,
  variant,
  children,
  data,
}: PropsWithChildren<FetchPoolProps> & { data: GetPoolQuery }) {
  const hook = _usePool({ id, chain, variant, initialData: data })
  return <PoolContext.Provider value={{ ...hook, chain }}>{children}</PoolContext.Provider>
}

export const usePool = (): UsePoolResponse => useMandatoryContext(PoolContext, 'Pool')

'use client'

import {
  getBoostedPoolStateWithBalancesV3,
  getPoolStateWithBalancesCowAmm,
  getPoolStateWithBalancesV2,
  getPoolStateWithBalancesV3,
} from '@balancer/sdk'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useQuery } from '@tanstack/react-query'
import { useBlockNumber } from 'wagmi'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { isBoosted, isCowAmmPool, isV2Pool, isV3Pool } from '../../../pool.helpers'
import { Pool } from '../../../pool.types'
import { getChainId } from '@repo/lib/config/app.config'

export type PoolStateWithBalancesQueryResult = ReturnType<typeof usePoolStateWithBalancesQuery>

export function usePoolStateWithBalancesQuery(pool: Pool) {
  const chainId = getChainId(pool.chain)
  const { data: blockNumber } = useBlockNumber({ chainId })

  const queryKey = [pool.id]

  const helpers = new LiquidityActionHelpers(pool)

  const queryFn = async () => {
    const rpcUrl = getRpcUrl(chainId)
    if (isV3Pool(pool)) {
      return isBoosted(pool)
        ? getBoostedPoolStateWithBalancesV3(helpers.boostedPoolState, chainId, rpcUrl)
        : getPoolStateWithBalancesV3(helpers.poolState, chainId, rpcUrl)
    }

    if (isV2Pool(pool)) {
      return getPoolStateWithBalancesV2(helpers.poolState, chainId, rpcUrl)
    }

    if (isCowAmmPool(pool.type)) {
      return getPoolStateWithBalancesCowAmm(helpers.poolState, chainId, rpcUrl)
    }

    throw new Error(`Unsupported pool : ${pool.id} for pool state with balances query`)
  }

  return useQuery({
    queryKey,
    queryFn,
    gcTime: 0,
    meta: {
      poolId: pool.id,
      chainId,
      blockNumber,
    },
    ...onlyExplicitRefetch,
  })
}

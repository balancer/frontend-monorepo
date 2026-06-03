import { getChainId } from '@repo/lib/config/app.config'
import { bn } from '@repo/lib/shared/utils/numbers'
import { compact, keyBy } from 'lodash'
import { Address, formatUnits, parseAbi } from 'viem'
import { useReadContracts } from 'wagmi'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { Pool } from '../pool.types'
import { BPT_DECIMALS } from '../pool.constants'
import { useMemo } from 'react'
import { useTokens } from '../../tokens/TokensProvider'

// All pool versions implement balanceOf, so the same ABI can be reused.
const balanceOfAbi = parseAbi(['function balanceOf(address account) view returns (uint256)'])

export type UnstakedBalanceByPoolId = ReturnType<
  typeof useUserUnstakedBalance
>['unstakedBalanceByPoolId']

export function useUserUnstakedBalance(pools: Pool[] = []) {
  const { userAddress, isConnected } = useUserAccount()
  const { priceFor } = useTokens()

  const contracts = useMemo(
    () =>
      pools.map(
        pool =>
          ({
            abi: balanceOfAbi,
            address: pool.address as Address,
            functionName: 'balanceOf',
            args: [userAddress as Address],
            chainId: getChainId(pool.chain),
          }) as const
      ),
    [pools, userAddress]
  )

  const {
    data: unstakedPoolBalances = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useReadContracts({
    allowFailure: false,
    query: {
      enabled: isConnected,
    },
    contracts,
  })

  // for each pool get the unstaked balance
  const balances = useMemo(() => {
    if (isFetching) return []

    return compact(
      unstakedPoolBalances.map((rawBalance, index) => {
        const pool = pools[index]
        if (!pool) return undefined

        const bptPrice = priceFor(pool.address, pool.chain)
        const humanUnstakedBalance = formatUnits(rawBalance || 0n, BPT_DECIMALS)

        return {
          poolId: pool.id,
          rawUnstakedBalance: rawBalance,
          unstakedBalance: humanUnstakedBalance,
          unstakedBalanceUsd: bn(humanUnstakedBalance).times(bptPrice),
        }
      })
    )
  }, [unstakedPoolBalances, pools, isFetching, priceFor])

  const unstakedBalanceByPoolId = useMemo(() => keyBy(balances, 'poolId'), [balances])

  return {
    unstakedBalanceByPoolId,
    isLoading,
    isFetching,
    refetch,
    error,
  }
}

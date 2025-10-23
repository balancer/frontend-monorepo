import { useQuery } from '@tanstack/react-query'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'
import { selectRemoveLiquidityHandler } from '@repo/lib/modules/pool/actions/remove-liquidity/handlers/selectRemoveLiquidityHandler'
import { RemoveLiquidityType } from '@repo/lib/modules/pool/actions/remove-liquidity/remove-liquidity.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { HumanAmount } from '@balancer/sdk'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useRelicDepositBalanceLogic() {
  const { pool } = usePool()
  const { usdValueForTokenAddress } = useTokens()
  const { selectedRelic } = useReliquary()
  const { userAddress } = useUserAccount()

  // Select the proportional remove liquidity handler
  const handler = useMemo(
    () => selectRemoveLiquidityHandler(pool, RemoveLiquidityType.Proportional),
    [pool]
  )

  const query = useQuery({
    queryKey: ['relicDepositBalance', selectedRelic?.relicId, selectedRelic?.amount, pool.id],
    queryFn: async () => {
      if (!userAddress) return []

      // Simulate proportional withdrawal to get estimated token amounts
      const result = await handler.simulate({
        humanBptIn: (selectedRelic?.amount || '0') as HumanAmount,
        tokenOut: pool.address as `0x${string}`, // Not used for proportional
        userAddress,
      })

      return result.amountsOut
    },
    enabled: !!selectedRelic && parseFloat(selectedRelic.amount) > 0 && !!userAddress,
  })

  // Calculate total USD value from token amounts
  const relicBalanceUSD = useMemo(() => {
    if (!query.data) return '0'

    return query.data
      .reduce((total, tokenAmount) => {
        const usdValue = usdValueForTokenAddress(
          tokenAmount.token.address,
          pool.chain,
          tokenAmount.amount
        )
        return total.plus(usdValue)
      }, bn(0))
      .toFixed(2)
  }, [query.data, usdValueForTokenAddress, pool.chain])

  return {
    ...query,
    relicBalanceUSD,
  }
}

export const RelicDepositBalanceContext = createContext<ReturnType<
  typeof useRelicDepositBalanceLogic
> | null>(null)

export function RelicDepositBalanceProvider(props: { children: ReactNode }) {
  const value = useRelicDepositBalanceLogic()

  return (
    <RelicDepositBalanceContext.Provider value={value}>
      {props.children}
    </RelicDepositBalanceContext.Provider>
  )
}

export function useRelicDepositBalance() {
  return useContext(RelicDepositBalanceContext) as ReturnType<typeof useRelicDepositBalanceLogic>
}

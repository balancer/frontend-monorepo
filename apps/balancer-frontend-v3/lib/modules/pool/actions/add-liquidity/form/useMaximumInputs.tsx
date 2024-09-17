/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTokenBalances } from '@/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { bn } from '@/lib/shared/utils/numbers'
import { Address, HumanAmount } from '@balancer/sdk'
import { useMemo, useState } from 'react'
import { usePool } from '../../../PoolProvider'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { useTotalUsdValue } from '@/lib/modules/tokens/useTotalUsdValue'

export function useMaximumInputs() {
  const { isConnected } = useUserAccount()
  const { validTokens, setHumanAmountsIn, wethIsEth, nativeAsset, wNativeAsset } = useAddLiquidity()
  const { usdValueFor } = useTotalUsdValue(validTokens)
  const { balances, isBalancesLoading } = useTokenBalances()
  const { isLoading: isPoolLoading } = usePool()
  const { isLoadingTokenPrices } = useTokens()
  const [isMaximized, setIsMaximized] = useState(false)

  const filteredBalances = useMemo(() => {
    return balances.filter(balance =>
      wethIsEth
        ? wNativeAsset && balance.address !== wNativeAsset.address
        : nativeAsset && balance.address !== nativeAsset.address
    )
  }, [wethIsEth, isBalancesLoading])

  function handleMaximizeUserAmounts() {
    if (isMaximized) return setIsMaximized(false)
    const amounts = filteredBalances
      .filter(balance => bn(balance.amount).gt(0))
      .map(balance => ({
        humanAmount: balance.formatted as HumanAmount,
        tokenAddress: balance.address as Address,
      }))
    setHumanAmountsIn(amounts)
    setIsMaximized(true)
  }

  const shouldCalculateMaximizeAmounts =
    isConnected && !isBalancesLoading && !isPoolLoading && balances.length > 0

  const maximizedUsdValue = useMemo(() => {
    if (!shouldCalculateMaximizeAmounts) return ''

    const maximumAmounts = filteredBalances.map(balance => ({
      humanAmount: balance.formatted as HumanAmount,
      tokenAddress: balance.address as Address,
    }))

    return usdValueFor(maximumAmounts)
  }, [shouldCalculateMaximizeAmounts, isLoadingTokenPrices, wethIsEth])

  const canMaximize = filteredBalances.some(balance => bn(balance.amount).gt(0))

  return {
    canMaximize,
    isMaximized,
    maximizedUsdValue,
    handleMaximizeUserAmounts,
    setIsMaximized,
  }
}

/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTokenBalances } from '@/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { bn } from '@/lib/shared/utils/numbers'
import { Address, HumanAmount, InputAmount, calculateProportionalAmounts } from '@balancer/sdk'
import { useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { usePool } from '../../../PoolProvider'
import {
  LiquidityActionHelpers,
  hasNoLiquidity,
  isEmptyHumanAmount,
} from '../../LiquidityActionHelpers'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { useTotalUsdValue } from '@/lib/modules/tokens/useTotalUsdValue'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { swapWrappedWithNative } from '@/lib/modules/tokens/token.helpers'

type OptimalToken = {
  tokenAddress: Address
  userBalance: HumanAmount
}

export function useProportionalInputs() {
  const { isConnected } = useUserAccount()
  const {
    validTokens,
    helpers,
    humanAmountsIn,
    setHumanAmountsIn,
    wethIsEth,
    nativeAsset,
    wNativeAsset,
  } = useAddLiquidity()
  const { usdValueFor } = useTotalUsdValue(validTokens)
  const { balanceFor, balances, isBalancesLoading } = useTokenBalances()
  const { isLoading: isPoolLoading, pool } = usePool()
  const [isMaximized, setIsMaximized] = useState(false)
  const { isLoadingTokenPrices } = useTokens()

  const filteredBalances = useMemo(() => {
    return balances.filter(balance =>
      wethIsEth
        ? wNativeAsset && balance.address !== wNativeAsset.address
        : nativeAsset && balance.address !== nativeAsset.address
    )
  }, [wethIsEth, isBalancesLoading])

  function clearAmountsIn(changedAmount?: HumanTokenAmountWithAddress) {
    setHumanAmountsIn(
      humanAmountsIn.map(({ tokenAddress }) => {
        // Keeps user inputs like '0' or '0.' instead of replacing them with ''
        if (changedAmount && isSameAddress(changedAmount.tokenAddress, tokenAddress)) {
          return changedAmount
        }

        return { tokenAddress, humanAmount: '' }
      })
    )
  }

  function handleMaximizeUserAmounts() {
    if (!optimalToken) return
    if (isMaximized) return setIsMaximized(false)
    handleProportionalHumanInputChange(optimalToken.tokenAddress, optimalToken.userBalance)
    setIsMaximized(true)
  }

  function handleProportionalHumanInputChange(tokenAddress: Address, humanAmount: HumanAmount) {
    // Checks if the user is entering the max amount for the tokenWithMinValue
    const isMaximizing: boolean =
      tokenAddress === optimalToken?.tokenAddress && humanAmount === optimalToken?.userBalance

    setIsMaximized(isMaximizing)

    if (isEmptyHumanAmount(humanAmount)) return clearAmountsIn({ tokenAddress, humanAmount })

    const proportionalHumanAmountsIn = _calculateProportionalHumanAmountsIn({
      tokenAddress,
      humanAmount,
      helpers,
      wethIsEth,
    })

    setHumanAmountsIn(proportionalHumanAmountsIn)
  }

  const shouldCalculateMaximizeAmounts =
    isConnected && !isBalancesLoading && !isPoolLoading && balances.length > 0

  /*
    Finds the optimal token.
    A token is optimal when using its maximum user balance produces a valid proportional amounts result
    (where the rest of the tokens have enough user balance for that proportional result).
  */
  const optimalToken = useMemo((): OptimalToken | undefined => {
    if (isLoadingTokenPrices || !shouldCalculateMaximizeAmounts || hasNoLiquidity(pool)) return

    const humanBalanceFor = (tokenAddress: string): HumanAmount => {
      return (balanceFor(tokenAddress)?.formatted || '0') as HumanAmount
    }

    const optimalToken = filteredBalances.find(({ address }) => {
      const humanBalance = humanBalanceFor(address)
      if (isEmptyHumanAmount(humanBalance)) return false

      const proportionalAmounts = _calculateProportionalHumanAmountsIn({
        tokenAddress: address as Address,
        humanAmount: humanBalance,
        helpers,
        wethIsEth,
      })

      // The user must have enough token balance for this proportional result
      const haveEnoughBalance = proportionalAmounts.every(({ tokenAddress, humanAmount }) => {
        return bn(humanBalanceFor(tokenAddress)).gte(bn(humanAmount))
      })

      return haveEnoughBalance
    })

    if (!optimalToken) return

    return {
      tokenAddress: optimalToken.address,
      userBalance: humanBalanceFor(optimalToken.address),
    } as OptimalToken
  }, [shouldCalculateMaximizeAmounts, filteredBalances])

  const maximizedUsdValue = useMemo(() => {
    if (!shouldCalculateMaximizeAmounts || !optimalToken) return ''

    const maxProportionalHumanAmountsIn = _calculateProportionalHumanAmountsIn({
      tokenAddress: optimalToken.tokenAddress as Address,
      humanAmount: optimalToken.userBalance,
      helpers,
      wethIsEth,
    })

    return usdValueFor(maxProportionalHumanAmountsIn)
  }, [shouldCalculateMaximizeAmounts, optimalToken, isLoadingTokenPrices])

  const canMaximize = !!optimalToken?.userBalance

  return {
    canMaximize,
    isMaximized,
    maximizedUsdValue,
    handleProportionalHumanInputChange,
    handleMaximizeUserAmounts,
    setIsMaximized,
    clearAmountsIn,
  }
}

type Params = {
  tokenAddress: Address
  humanAmount: HumanAmount
  helpers: LiquidityActionHelpers
  wethIsEth: boolean
}
export function _calculateProportionalHumanAmountsIn({
  tokenAddress,
  humanAmount,
  helpers,
  wethIsEth,
}: Params): HumanTokenAmountWithAddress[] {
  const amountIn: InputAmount = helpers.toSdkInputAmounts([{ tokenAddress, humanAmount }])[0]
  const proportionalAmounts = calculateProportionalAmounts(helpers.poolStateWithBalances, amountIn)
    .tokenAmounts.map(({ address, rawAmount, decimals }) => {
      // Use the humanAmount entered by the user to avoid displaying rounding updates from calculateProportionalAmounts
      if (address === tokenAddress) return { tokenAddress, humanAmount }

      return {
        tokenAddress: address,
        humanAmount: formatUnits(rawAmount, decimals) as HumanAmount,
      }
    })
    // user updated token must be in the first place of the array because the Proportional handler always calculates bptOut based on the first position
    .sort(sortUpdatedTokenFirst(tokenAddress))

  return wethIsEth
    ? // toSdkInputAmounts swapped native to wrapped so we need to swap back
      swapWrappedWithNative(proportionalAmounts, helpers.pool.chain)
    : proportionalAmounts

  function sortUpdatedTokenFirst(tokenAddress: Address | null) {
    return (a: HumanTokenAmountWithAddress, b: HumanTokenAmountWithAddress) => {
      if (!tokenAddress) return 0
      if (isSameAddress(a.tokenAddress, tokenAddress)) return -1
      if (isSameAddress(b.tokenAddress, tokenAddress)) return 1
      return 0
    }
  }
}

/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Address, HumanAmount, InputAmount, calculateProportionalAmounts } from '@balancer/sdk'
import { swapWrappedWithNative } from '@repo/lib/modules/tokens/token.helpers'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { formatUnits } from 'viem'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { usePool } from '../../../PoolProvider'
import { LiquidityActionHelpers, isEmptyHumanAmount } from '../../LiquidityActionHelpers'
import { useAddLiquidity } from '../AddLiquidityProvider'

export function useProportionalInputs() {
  const { isConnected } = useUserAccount()
  const { helpers, setHumanAmountsIn, clearAmountsIn, wethIsEth, setReferenceAmountAddress } =
    useAddLiquidity()
  const { balances, isBalancesLoading } = useTokenBalances()
  const { isLoading: isPoolLoading } = usePool()

  function handleProportionalHumanInputChange(token: ApiToken, humanAmount: HumanAmount) {
    const tokenAddress = token.address as Address
    if (isEmptyHumanAmount(humanAmount)) {
      return clearAmountsIn({ tokenAddress, humanAmount, symbol: token.symbol })
    }

    setReferenceAmountAddress(tokenAddress)

    const proportionalHumanAmountsIn = _calculateProportionalHumanAmountsIn({
      token,
      humanAmount,
      helpers,
      wethIsEth,
    })

    const proportionalHumanAmountsInWithOriginalUserInput = proportionalHumanAmountsIn.map(
      amount => {
        if (isSameAddress(amount.tokenAddress, tokenAddress)) {
          return { ...amount, humanAmount } // We don't want to change the user input with the result of the proportional calculation
        }
        return amount
      }
    )

    setHumanAmountsIn(proportionalHumanAmountsInWithOriginalUserInput)
  }

  /*
    TODO: show warning/tooltip/alert when one of the tokens have zero balance
    (same for unbalanced tab when all tokens have zero balance)
    Old implementation:
    https://github.com/balancer/frontend-monorepo/blob/f68ad17b46f559e2e5556d972a193b3fa6e3706b/packages/lib/modules/pool/actions/add-liquidity/form/TokenInputsWithAddable.tsx#L122
  */
  const hasBalanceForAllTokens =
    isConnected && !isBalancesLoading && !isPoolLoading && balances.length > 0

  return {
    hasBalanceForAllTokens,
    handleProportionalHumanInputChange,
  }
}

type Params = {
  token: ApiToken
  humanAmount: HumanAmount
  helpers: LiquidityActionHelpers
  wethIsEth: boolean
}
export function _calculateProportionalHumanAmountsIn({
  token,
  humanAmount,
  helpers,
  wethIsEth,
}: Params): HumanTokenAmountWithAddress[] {
  const tokenAddress = token.address as Address
  const symbol = token.symbol
  const referenceAmount: InputAmount = helpers.toSdkInputAmounts([
    { tokenAddress, humanAmount, symbol },
  ])[0]

  const proportionalAmounts = calculateProportionalAmounts(
    helpers.poolStateWithBalances,
    referenceAmount
  )
    .tokenAmounts.map(({ address, rawAmount, decimals }) => {
      // Use the humanAmount entered by the user to avoid displaying rounding updates from calculateProportionalAmounts
      if (address === tokenAddress) return { tokenAddress, humanAmount, symbol }

      return {
        tokenAddress: address,
        humanAmount: formatUnits(rawAmount, decimals) as HumanAmount,
        symbol,
      } as HumanTokenAmountWithAddress
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

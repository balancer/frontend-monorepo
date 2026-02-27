'use client'

import {
  Address,
  HumanAmount,
  InputAmount,
  PoolStateWithBalances,
  PoolStateWithUnderlyingBalances,
  calculateProportionalAmounts,
  calculateProportionalAmountsBoosted,
} from '@balancer/sdk'
import { swapWrappedWithNative } from '@repo/lib/modules/tokens/token.helpers'
import { ApiToken, HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { isBoosted } from '../../../pool.helpers'
import { usePool } from '../../../PoolProvider'
import { LiquidityActionHelpers, isEmptyHumanAmount } from '../../LiquidityActionHelpers'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { usePoolStateWithBalancesQuery } from '../queries/usePoolStateWithBalancesQuery'

export function useProportionalInputs() {
  const { isConnected } = useUserAccount()
  const {
    helpers,
    tokens,
    setHumanAmountsIn,
    clearAmountsIn,
    wethIsEth,
    wrapUnderlying,
    setReferenceAmountAddress,
  } = useAddLiquidity()

  const { balances, balanceFor, isBalancesLoading } = useTokenBalances()
  const { isLoading: isPoolLoading, pool } = usePool()

  const { data: poolStateWithBalances, isLoading: isPoolStateWithBalancesLoading } =
    usePoolStateWithBalancesQuery(pool)

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
      wrapUnderlying,
      poolStateWithBalances,
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
    isConnected &&
    !isBalancesLoading &&
    !isPoolLoading &&
    !isPoolStateWithBalancesLoading &&
    balances.length > 0 &&
    tokens.length > 0 &&
    tokens.every(token => {
      return bn(humanBalanceFor(token.address as Address)).gt(0)
    })

  const maxProportionalHumanAmountsIn = (() => {
    if (!hasBalanceForAllTokens || !poolStateWithBalances) return

    const optimalToken = tokens.find(token => {
      const userBalance = humanBalanceFor(token.address as Address)

      const proportionalHumanAmountsIn = _calculateProportionalHumanAmountsIn({
        token,
        humanAmount: userBalance,
        helpers,
        wethIsEth,
        wrapUnderlying,
        poolStateWithBalances,
      })

      return proportionalHumanAmountsIn.every(({ tokenAddress, humanAmount }) => {
        if (humanAmount === '') return true

        return bn(humanBalanceFor(tokenAddress)).gte(humanAmount)
      })
    })

    if (!optimalToken) return

    return _calculateProportionalHumanAmountsIn({
      token: optimalToken,
      humanAmount: humanBalanceFor(optimalToken.address as Address),
      helpers,
      wethIsEth,
      wrapUnderlying,
      poolStateWithBalances,
    })
  })()

  function handleMaximizeProportionalAmounts() {
    if (!maxProportionalHumanAmountsIn?.length) return

    setReferenceAmountAddress(maxProportionalHumanAmountsIn[0].tokenAddress)
    setHumanAmountsIn(maxProportionalHumanAmountsIn)
  }

  function humanBalanceFor(tokenAddress: Address): HumanAmount {
    return (balanceFor(tokenAddress)?.formatted || '0') as HumanAmount
  }

  return {
    hasBalanceForAllTokens,
    maxProportionalHumanAmountsIn,
    handleProportionalHumanInputChange,
    handleMaximizeProportionalAmounts,
  }
}

type Params = {
  token: ApiToken
  humanAmount: HumanAmount
  helpers: LiquidityActionHelpers
  wethIsEth: boolean
  wrapUnderlying: boolean[]
  poolStateWithBalances?: PoolStateWithUnderlyingBalances | PoolStateWithBalances
}
export function _calculateProportionalHumanAmountsIn({
  token,
  humanAmount,
  helpers,
  wethIsEth,
  wrapUnderlying,
  poolStateWithBalances,
}: Params): HumanTokenAmountWithSymbol[] {
  const tokenAddress = token.address as Address
  const symbol = token.symbol
  const referenceAmount: InputAmount = helpers.toSdkInputAmounts([
    { tokenAddress, humanAmount, symbol },
  ])[0]

  if (!poolStateWithBalances) {
    throw new Error('Cannot calculate proportional amounts without pool state')
  }

  const sdkProportionalAmounts = isBoosted(helpers.pool)
    ? calculateProportionalAmountsBoosted(
        poolStateWithBalances as PoolStateWithUnderlyingBalances,
        referenceAmount,
        wrapUnderlying
      )
    : calculateProportionalAmounts(poolStateWithBalances, referenceAmount)

  const proportionalAmounts = sdkProportionalAmounts.tokenAmounts
    .map(({ address, rawAmount, decimals }) => {
      // Use the humanAmount entered by the user to avoid displaying rounding updates from calculateProportionalAmounts
      if (address === tokenAddress) return { tokenAddress, humanAmount, symbol }

      return {
        tokenAddress: address,
        humanAmount: formatUnits(rawAmount, decimals) as HumanAmount,
        symbol,
      } as HumanTokenAmountWithSymbol
    })
    // user updated token must be in the first place of the array because the Proportional handler always calculates bptOut based on the first position
    .sort(sortUpdatedTokenFirst(tokenAddress))

  return wethIsEth
    ? // toSdkInputAmounts swapped native to wrapped so we need to swap back
      swapWrappedWithNative(proportionalAmounts, helpers.pool.chain)
    : proportionalAmounts

  function sortUpdatedTokenFirst(tokenAddress: Address | null) {
    return (a: HumanTokenAmountWithSymbol, b: HumanTokenAmountWithSymbol) => {
      if (!tokenAddress) return 0
      if (isSameAddress(a.tokenAddress, tokenAddress)) return -1
      if (isSameAddress(b.tokenAddress, tokenAddress)) return 1
      return 0
    }
  }
}

'use client'

import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { BalAlert } from '../../../shared/components/alerts/BalAlert'
import { useReadContracts } from 'wagmi'
import { vaultAdminAbi_V3, AddressProvider } from '@balancer/sdk'
import { formatUnits } from 'viem'

type Props = {
  validTokens: ApiToken[]
  amounts: HumanTokenAmountWithAddress[]
  operation: 'add' | 'remove'
}

export function useBufferBalanceWarning({ amounts, validTokens, operation }: Props) {
  const humanUnderlyingAmounts = amounts.filter(amount =>
    validTokens.some(
      token =>
        token.address === amount.tokenAddress &&
        token.wrappedToken &&
        token.useUnderlyingForAddRemove
    )
  )

  const wrappedTokensForAdd = validTokens.filter(token => token.underlyingToken)
  const wrappedTokensForRemove = validTokens
    .filter(token => token.wrappedToken)
    .map(token => token.wrappedToken)
    .filter(token => token !== undefined)

  const {
    bufferBalances: bufferBalancesForAdd,
    isLoadingBufferBalances: isLoadingBufferBalancesForAdd,
  } = useBufferBalances(wrappedTokensForAdd)

  const {
    bufferBalances: bufferBalancesForRemove,
    isLoadingBufferBalances: isLoadingBufferBalancesForRemove,
  } = useBufferBalances(wrappedTokensForRemove)

  const errors = humanUnderlyingAmounts
    .map(({ tokenAddress, humanAmount, symbol: amountSymbol }) => {
      if (operation === 'add') {
        // if operation is add liquidity, the user is offering underlying token which requires wrapped tokens from buffer
        const wrappedToken = validTokens.find(
          validToken => tokenAddress === validToken.underlyingToken?.address
        )
        const maxDeposit = wrappedToken?.maxDeposit ?? 0
        const bufferBalances = bufferBalancesForAdd?.find(
          bufferBalance => bufferBalance.wrappedTokenAddress === wrappedToken?.address
        )

        if (!bufferBalances || !wrappedToken || !wrappedToken.priceRate) return null
        const wrappedTokenBufferBalance = bufferBalances?.wrappedBalanceHuman
        const halfBufferTotalBalance = bn(bufferBalances?.bufferTotalBalanceHuman).div(2)

        // convert underlying amount to wrapped amount using wrapped rate?
        const adjustedAmountIn = bn(humanAmount).div(wrappedToken.priceRate)

        // if user wants to add more underlying token than the buffer has wrapped tokens to swap for
        if (bn(adjustedAmountIn).gt(bn(wrappedTokenBufferBalance))) {
          // if maxDeposit of erc4626 vault is less than half of bufferTotalBalance plus adjustedAmountIn minus wrappedTokenBufferBalance
          if (
            bn(maxDeposit).lt(
              halfBufferTotalBalance.plus(bn(adjustedAmountIn).minus(bn(wrappedTokenBufferBalance)))
            )
          ) {
            // then max amount of underlying token user can add is however much underlying can be swapped for wrapped buffer balance
            return {
              amountSymbol,
              // multiply wrapped buffer balance by wrapped rate to get max underlying amount user can add?
              maxAmount: bn(wrappedTokenBufferBalance).times(wrappedToken.priceRate),
            }
          } else {
            return null
          }
        } else {
          return null
        }
      } else {
        // if operation is remove liquidity, the user is giving BPT and asking for underlying token from buffer
        const underlyingToken = validTokens.find(validToken => tokenAddress === validToken.address)
        const maxWithdraw = underlyingToken?.maxWithdraw ?? 0

        const bufferBalances = bufferBalancesForRemove?.find(
          bufferBalance => bufferBalance.underlyingTokenAddress === underlyingToken?.address
        )

        if (!bufferBalances || !amountSymbol) return null

        const underlyingTokenBufferBalance = bufferBalances?.underlyingBalanceHuman
        const halfTotalBufferBalance = bn(bufferBalances?.bufferTotalBalanceHuman).div(2)

        // if amountOut user wants is greater than buffer balance
        if (bn(humanAmount).gt(bn(underlyingTokenBufferBalance ?? 0))) {
          // if maxWithdraw of erc4626 vault is less than half of bufferTotalBalance plus amountOut minus underlyingTokenBufferBalance
          if (
            bn(maxWithdraw).lt(
              halfTotalBufferBalance.plus(bn(humanAmount).minus(bn(underlyingTokenBufferBalance)))
            )
          ) {
            // then the max user can withdraw is the buffer balance since the maxWithdraw is insufficent to get buffer to 50/50 again
            return { amountSymbol, maxAmount: underlyingTokenBufferBalance }
          } else {
            return null
          }
        } else {
          return null
        }
      }
    })
    .filter(error => error !== null)

  if (operation === 'add' && isLoadingBufferBalancesForAdd) return null
  if (operation === 'remove' && isLoadingBufferBalancesForRemove) return null

  return errors.length > 0
    ? errors.map(({ amountSymbol, maxAmount }, idx) => (
        <BalAlert
          content={`The maximum ${operation === 'add' ? 'deposit' : 'withdraw'} amount is currently ${fNum('integer', maxAmount)} ${amountSymbol}`}
          key={idx}
          status="warning"
          title="Amount exceeds buffer limits"
        />
      ))
    : null
}

function useBufferBalances(wrappedTokens: ApiToken[]) {
  const { data, isLoading } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: vaultAdminAbi_V3,
      address: AddressProvider.Vault(token.chainId),
      functionName: 'getBufferBalance',
      args: [token.address],
    })),
  })

  const bufferBalances = data?.map((item, index) => {
    const result = item.result as readonly [bigint, bigint] | undefined

    const underlyingBalanceRaw = result?.[0]
    const wrappedBalanceRaw = result?.[1]

    const underlyingBalanceHuman = Number(
      formatUnits(underlyingBalanceRaw ?? 0n, wrappedTokens[index].underlyingToken?.decimals ?? 0)
    )
    const wrappedBalanceHuman = Number(
      formatUnits(wrappedBalanceRaw ?? 0n, wrappedTokens[index].wrappedToken?.decimals ?? 0)
    )
    const bufferTotalBalanceHuman = underlyingBalanceHuman + wrappedBalanceHuman

    return {
      underlyingTokenAddress: wrappedTokens[index].underlyingToken?.address,
      wrappedTokenAddress: wrappedTokens[index].address,
      underlyingBalanceHuman,
      wrappedBalanceHuman,
      bufferTotalBalanceHuman,
    }
  })

  return { bufferBalances, isLoadingBufferBalances: isLoading }
}

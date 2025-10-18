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

  const wrappedTokens = validTokens.filter(token => token.underlyingToken)

  const { bufferBalances, isLoadingBufferBalances } = useBufferBalances(wrappedTokens)

  const bufferLimitViolations = humanUnderlyingAmounts
    .map(({ tokenAddress, humanAmount, symbol: amountSymbol }) => {
      if (operation === 'add') {
        // if operation is add liquidity, the user is offering underlying token which requires wrapped tokens from buffer
        const wrappedToken = validTokens.find(
          validToken => tokenAddress === validToken.underlyingToken?.address
        )
        const wrappedBufferBalance = bufferBalances?.find(
          bufferBalance => bufferBalance.wrappedTokenAddress === wrappedToken?.address
        )

        if (!wrappedBufferBalance || !wrappedToken || !wrappedToken.priceRate) return null

        const wrappedTokenBufferBalance = wrappedBufferBalance?.wrappedBalanceHuman
        const halfBufferTotalBalance = bn(wrappedBufferBalance?.bufferTotalBalanceHuman).div(2)

        // convert underlying amount to wrapped amount using wrapped rate?
        const adjustedAmountIn = bn(humanAmount).div(wrappedToken.priceRate)
        const maxDeposit = wrappedToken?.maxDeposit ?? 0

        const exceedsBufferBalance = bn(adjustedAmountIn).gt(bn(wrappedTokenBufferBalance))
        const exceedsVaultCapacity = bn(maxDeposit).lt(
          halfBufferTotalBalance.plus(bn(adjustedAmountIn).minus(bn(wrappedTokenBufferBalance)))
        )

        if (exceedsBufferBalance && exceedsVaultCapacity) {
          return {
            amountSymbol,
            // multiply wrapped buffer balance by wrapped rate to get max underlying amount user can add?
            maxAmount: bn(wrappedTokenBufferBalance).times(wrappedToken.priceRate),
          }
        }

        return null
      } else {
        // if operation is remove liquidity, the user is giving BPT ( which represents some amount of wrapped tokens )
        // user is asking for underlying token from buffer
        const underlyingToken = validTokens.find(validToken => tokenAddress === validToken.address)
        const underlyingBufferBalance = bufferBalances?.find(
          bufferBalance => bufferBalance.underlyingTokenAddress === underlyingToken?.address
        )

        if (!underlyingBufferBalance || !amountSymbol) return null

        const underlyingTokenBufferBalance = underlyingBufferBalance.underlyingBalanceHuman
        const halfTotalBufferBalance = bn(underlyingBufferBalance.bufferTotalBalanceHuman).div(2)
        const maxWithdraw = underlyingToken?.maxWithdraw ?? 0

        const exceedsBufferBalance = bn(humanAmount).gt(bn(underlyingTokenBufferBalance))
        const exceedsVaultCapacity = bn(maxWithdraw).lt(
          halfTotalBufferBalance.plus(bn(humanAmount).minus(bn(underlyingTokenBufferBalance)))
        )

        if (exceedsBufferBalance && exceedsVaultCapacity) {
          return {
            amountSymbol,
            maxAmount: underlyingTokenBufferBalance,
          }
        }

        return null
      }
    })
    .filter(bufferViolation => bufferViolation !== null)

  if (isLoadingBufferBalances) return null
  if (bufferLimitViolations.length === 0) return null

  return bufferLimitViolations.map(({ amountSymbol, maxAmount }, idx) => (
    <BalAlert
      content={`The maximum ${operation === 'add' ? 'deposit' : 'withdraw'} amount is currently ${fNum('integer', maxAmount)} ${amountSymbol}`}
      key={idx}
      status="warning"
      title="Amount exceeds buffer limits"
    />
  ))
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

    const underlyingBalanceRaw = result?.[0] ?? 0n
    const wrappedBalanceRaw = result?.[1] ?? 0n
    const underlyingDecimals = wrappedTokens[index].underlyingToken?.decimals ?? 0
    const wrappedDecimals = wrappedTokens[index].wrappedToken?.decimals ?? 0

    const underlyingBalanceHuman = Number(formatUnits(underlyingBalanceRaw, underlyingDecimals))
    const wrappedBalanceHuman = Number(formatUnits(wrappedBalanceRaw, wrappedDecimals))
    const bufferTotalBalanceHuman = underlyingBalanceHuman + wrappedBalanceHuman
    const underlyingTokenAddress = wrappedTokens[index].underlyingToken?.address
    const wrappedTokenAddress = wrappedTokens[index].address

    return {
      underlyingTokenAddress,
      wrappedTokenAddress,
      underlyingBalanceHuman,
      wrappedBalanceHuman,
      bufferTotalBalanceHuman,
    }
  })

  return { bufferBalances, isLoadingBufferBalances: isLoading }
}

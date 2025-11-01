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

  if (isLoadingBufferBalances) return null

  const bufferLimitViolations = humanUnderlyingAmounts
    .map(({ tokenAddress, humanAmount, symbol: amountSymbol }) => {
      if (operation === 'add') {
        // if operation is add liquidity, the user is offering underlying tokens which requires sufficient buffer balance of wrapped tokens
        const wrappedToken = validTokens.find(
          validToken => tokenAddress === validToken.underlyingToken?.address
        )
        const wrappedBufferBalance = bufferBalances?.find(
          bufferBalance => bufferBalance.wrappedTokenAddress === wrappedToken?.address
        )

        if (!wrappedBufferBalance || !wrappedToken || !wrappedToken.priceRate) return null

        const { bufferBalanceOfWrapped, halfOfBufferTotalLiquidityAsWrapped } = wrappedBufferBalance

        const wrappedAmountRequired = bn(humanAmount).div(wrappedToken.priceRate)
        const exceedsBufferBalance = wrappedAmountRequired.gt(bufferBalanceOfWrapped)

        const maxDeposit = bn(wrappedToken?.maxDeposit ?? 0)
        const exceedsVaultCapacity = maxDeposit.lt(
          halfOfBufferTotalLiquidityAsWrapped.plus(
            wrappedAmountRequired.minus(bufferBalanceOfWrapped)
          )
        )

        if (exceedsBufferBalance && exceedsVaultCapacity) {
          const maxAmountOfUnderlying = bufferBalanceOfWrapped.times(wrappedToken.priceRate)
          return { amountSymbol, maxAmountOfUnderlying }
        }

        return null
      } else {
        // if operation is remove liquidity, the user is offering wrapped tokens which requires sufficient buffer balance of underlying tokens
        const underlyingToken = validTokens.find(validToken => tokenAddress === validToken.address)
        const underlyingBufferBalance = bufferBalances?.find(
          bufferBalance => bufferBalance.underlyingTokenAddress === underlyingToken?.address
        )

        if (!underlyingBufferBalance || !amountSymbol) return null
        const { halfOfBufferTotalLiquidityAsUnderlying, bufferBalanceOfUnderlying } =
          underlyingBufferBalance

        const underlyingAmountRequired = bn(humanAmount)
        const exceedsBufferBalance = underlyingAmountRequired.gt(bufferBalanceOfUnderlying)

        const maxWithdraw = bn(underlyingToken?.maxWithdraw ?? 0)
        const exceedsVaultCapacity = maxWithdraw.lt(
          halfOfBufferTotalLiquidityAsUnderlying.plus(
            underlyingAmountRequired.minus(bufferBalanceOfUnderlying)
          )
        )

        if (exceedsBufferBalance && exceedsVaultCapacity) {
          return { amountSymbol, maxAmountOfUnderlying: bufferBalanceOfUnderlying }
        }

        return null
      }
    })
    .filter(bufferViolation => bufferViolation !== null)

  if (bufferLimitViolations.length === 0) return null

  return bufferLimitViolations.map(({ amountSymbol, maxAmountOfUnderlying }, idx) => (
    <BalAlert
      content={`The maximum ${operation === 'add' ? 'deposit' : 'withdraw'} amount is currently ${fNum('integer', maxAmountOfUnderlying)} ${amountSymbol}`}
      key={idx}
      status="warning"
      title="Underlying amount exceeds buffer limits"
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
    query: { enabled: wrappedTokens.length > 0 },
  })

  const bufferBalances = data
    ?.map((item, index) => {
      const result = item.result as readonly [bigint, bigint] | undefined
      const wrappedToken = wrappedTokens[index]

      const underlyingBalanceRaw = result?.[0]
      const wrappedBalanceRaw = result?.[1]
      const underlyingDecimals = wrappedToken.underlyingToken?.decimals
      const wrappedDecimals = wrappedToken?.decimals

      if (
        !underlyingBalanceRaw ||
        !wrappedBalanceRaw ||
        !underlyingDecimals ||
        !wrappedDecimals ||
        !wrappedToken?.priceRate
      ) {
        return null
      }

      const bufferBalanceOfUnderlying = bn(formatUnits(underlyingBalanceRaw, underlyingDecimals))
      const bufferBalanceOfWrapped = bn(formatUnits(wrappedBalanceRaw, wrappedDecimals))

      const bufferTotalLiquidityAsUnderlying = bufferBalanceOfUnderlying.plus(
        bufferBalanceOfWrapped.times(wrappedToken.priceRate)
      )
      const halfOfBufferTotalLiquidityAsUnderlying = bufferTotalLiquidityAsUnderlying.div(2)
      const halfOfBufferTotalLiquidityAsWrapped = halfOfBufferTotalLiquidityAsUnderlying.div(
        wrappedToken.priceRate
      )

      const underlyingTokenAddress = wrappedTokens[index].underlyingToken?.address
      const wrappedTokenAddress = wrappedTokens[index].address

      return {
        underlyingTokenAddress,
        wrappedTokenAddress,
        bufferBalanceOfUnderlying,
        bufferBalanceOfWrapped,
        halfOfBufferTotalLiquidityAsUnderlying,
        halfOfBufferTotalLiquidityAsWrapped,
      }
    })
    .filter(bufferBalance => bufferBalance !== null)

  return { bufferBalances, isLoadingBufferBalances: isLoading }
}

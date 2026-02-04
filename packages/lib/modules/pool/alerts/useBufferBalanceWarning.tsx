'use client'

import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Text } from '@chakra-ui/react'
import { BalAlert } from '../../../shared/components/alerts/BalAlert'
import { useReadContracts } from 'wagmi'
import { vaultAdminAbi_V3, AddressProvider } from '@balancer/sdk'
import { formatUnits, erc4626Abi, Address } from 'viem'

type Props = {
  validTokens: ApiToken[]
  amounts: HumanTokenAmountWithSymbol[]
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

  const wrappedTokens =
    operation === 'add'
      ? validTokens.filter(token => token.underlyingToken)
      : validTokens.map(token => token.wrappedToken).filter(token => token !== undefined)
  const { bufferBalances, isLoadingBufferBalances } = useBufferBalances(wrappedTokens)

  if (isLoadingBufferBalances) return null

  // validTokens always have symbol but amounts do not
  const underlyingAmounts = humanUnderlyingAmounts.map(({ tokenAddress, humanAmount }) => {
    const tokenSymbol = validTokens.find(
      token => token.address.toLowerCase() === tokenAddress.toLowerCase()
    )?.symbol
    return {
      tokenAddress,
      humanAmount: humanAmount,
      symbol: tokenSymbol,
    }
  })

  const bufferLimitViolations = underlyingAmounts
    .map(({ tokenAddress, humanAmount, symbol: underlyingSymbol }) => {
      if (operation === 'add') {
        // if operation is add liquidity, the user is offering underlying tokens which requires sufficient buffer balance of wrapped tokens
        const wrappedToken = validTokens.find(
          validToken => tokenAddress === validToken.underlyingToken?.address
        )
        const bufferBalance = bufferBalances?.find(
          bufferBalance => bufferBalance.wrappedTokenAddress === wrappedToken?.address
        )

        if (!bufferBalance || !wrappedToken || !wrappedToken.priceRate) return null

        const { bufferBalanceOfWrapped, halfOfBufferTotalLiquidityAsWrapped, maxDeposit } =
          bufferBalance

        const wrappedAmountRequired = bn(humanAmount).div(wrappedToken.priceRate)
        const exceedsBufferBalance = wrappedAmountRequired.gt(bufferBalanceOfWrapped)

        // is erc4626 maxDeposit insufficient to perform balancer vault buffer rebalance operation?
        const exceedsVaultCapacity = maxDeposit.lt(
          halfOfBufferTotalLiquidityAsWrapped.plus(
            wrappedAmountRequired.minus(bufferBalanceOfWrapped)
          )
        )

        if (exceedsBufferBalance && exceedsVaultCapacity) {
          return { underlyingSymbol, wrappedSymbol: wrappedToken.symbol }
        }

        return null
      } else {
        // if operation is remove liquidity, the user is offering wrapped tokens which requires sufficient buffer balance of underlying tokens
        const underlyingToken = validTokens.find(validToken => tokenAddress === validToken.address)
        const bufferBalance = bufferBalances?.find(
          bufferBalance => bufferBalance.underlyingTokenAddress === underlyingToken?.address
        )

        if (!bufferBalance || !underlyingSymbol) return null

        const { halfOfBufferTotalLiquidityAsUnderlying, bufferBalanceOfUnderlying, maxWithdraw } =
          bufferBalance

        const underlyingAmountRequired = bn(humanAmount)
        const exceedsBufferBalance = underlyingAmountRequired.gt(bufferBalanceOfUnderlying)

        // is erc4626 maxWithdraw insufficient to perform the required balancer vault buffer rebalance operation?
        const exceedsVaultCapacity = maxWithdraw.lt(
          halfOfBufferTotalLiquidityAsUnderlying.plus(
            underlyingAmountRequired.minus(bufferBalanceOfUnderlying)
          )
        )

        if (exceedsBufferBalance && exceedsVaultCapacity) {
          return {
            underlyingSymbol,
            wrappedSymbol: underlyingToken?.wrappedToken?.symbol,
          }
        }

        return null
      }
    })
    .filter(bufferViolation => bufferViolation !== null)

  if (bufferLimitViolations.length === 0) return null

  return bufferLimitViolations.map(({ underlyingSymbol, wrappedSymbol }, idx) => {
    const action = operation === 'add' ? 'deposit' : 'withdrawal'
    const isRemoveLiquidity = operation === 'remove'

    const selectedTokenSymbol = isRemoveLiquidity ? underlyingSymbol : wrappedSymbol

    return (
      <BalAlert
        content={
          <>
            <Text color="black" mb="sm">
              Liquidity buffers in v3 Boosted pools facilitate instant, gas-efficient transitions
              between the wrapped yield generating tokens and the unwrapped underlying tokens.
            </Text>
            <Text color="black">
              Unfortunately, the {selectedTokenSymbol} in this pool's buffer is too small to allow
              for your {action}. Instead, you can {action} any amount as {wrappedSymbol} (the
              yield-bearing token)
              {isRemoveLiquidity && ', which you can then unwrap later on the lending protocol'}.
            </Text>
          </>
        }
        key={idx}
        status="warning"
        title={`Insufficient buffer liquidity for your ${underlyingSymbol} ${action}`}
      />
    )
  })
}

function useBufferBalances(wrappedTokens: ApiToken[]) {
  const { data: bufferBalanceData, isLoading } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: vaultAdminAbi_V3,
      address: AddressProvider.Vault(token.chainId),
      functionName: 'getBufferBalance' as const,
      args: [token.address],
    })),
    query: { enabled: wrappedTokens.length > 0 },
  })

  const { data: maxDepositData } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: erc4626Abi,
      address: token.address as Address,
      functionName: 'maxDeposit',
      args: [AddressProvider.Vault(token.chainId)],
    })),
  })

  const { data: maxWithdrawData } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: erc4626Abi,
      address: token.address as Address,
      functionName: 'maxWithdraw',
      args: [AddressProvider.Vault(token.chainId)],
    })),
  })

  const data = wrappedTokens.map((token, index) => {
    const bufferUnderlyingBalanceRaw = bufferBalanceData?.[index]?.result?.[0] ?? 0n
    const bufferWrappedBalanceRaw = bufferBalanceData?.[index]?.result?.[1] ?? 0n
    const maxDeposit = bn(maxDepositData?.[index]?.result ?? 0n)
    const maxWithdraw = bn(maxWithdrawData?.[index]?.result ?? 0n)

    return {
      underlyingTokenAddress: token.underlyingToken?.address,
      wrappedTokenAddress: token.address,
      underlyingTokenDecimals: token.underlyingToken?.decimals,
      wrappedTokenDecimals: token.decimals,
      wrappedTokenPriceRate: token.priceRate,
      bufferUnderlyingBalanceRaw,
      bufferWrappedBalanceRaw,
      maxDeposit,
      maxWithdraw,
    }
  })

  const bufferBalances = data
    .map(
      ({
        bufferUnderlyingBalanceRaw,
        bufferWrappedBalanceRaw,
        maxDeposit,
        maxWithdraw,
        underlyingTokenDecimals,
        wrappedTokenDecimals,
        wrappedTokenPriceRate,
        underlyingTokenAddress,
        wrappedTokenAddress,
      }) => {
        if (
          !bufferUnderlyingBalanceRaw ||
          !bufferWrappedBalanceRaw ||
          !underlyingTokenDecimals ||
          !wrappedTokenDecimals ||
          !wrappedTokenPriceRate
        ) {
          return null
        }

        const bufferBalanceOfUnderlying = bn(
          formatUnits(bufferUnderlyingBalanceRaw, underlyingTokenDecimals)
        )
        const bufferBalanceOfWrapped = bn(
          formatUnits(bufferWrappedBalanceRaw, wrappedTokenDecimals)
        )

        const bufferTotalLiquidityAsUnderlying = bufferBalanceOfUnderlying.plus(
          bufferBalanceOfWrapped.times(wrappedTokenPriceRate)
        )
        const halfOfBufferTotalLiquidityAsUnderlying = bufferTotalLiquidityAsUnderlying.div(2)
        const halfOfBufferTotalLiquidityAsWrapped =
          halfOfBufferTotalLiquidityAsUnderlying.div(wrappedTokenPriceRate)

        return {
          underlyingTokenAddress,
          wrappedTokenAddress,
          bufferBalanceOfUnderlying,
          bufferBalanceOfWrapped,
          halfOfBufferTotalLiquidityAsUnderlying,
          halfOfBufferTotalLiquidityAsWrapped,
          maxDeposit,
          maxWithdraw,
        }
      }
    )
    .filter(bufferBalance => bufferBalance !== null)

  return { bufferBalances, isLoadingBufferBalances: isLoading }
}

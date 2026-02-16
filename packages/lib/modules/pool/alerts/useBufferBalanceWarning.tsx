import { HumanTokenAmountWithSymbol, ApiToken } from '@repo/lib/modules/tokens/token.types'
import BigNumber from 'bignumber.js'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Text } from '@chakra-ui/react'
import { BalAlert } from '../../../shared/components/alerts/BalAlert'
import { useReadContracts } from 'wagmi'
import { vaultAdminAbi_V3, AddressProvider } from '@balancer/sdk'
import { formatUnits, erc4626Abi, Address } from 'viem'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type UseBufferBalanceWarningParams = {
  validTokens: ApiToken[]
  amounts: HumanTokenAmountWithSymbol[]
  operation: 'add' | 'remove'
}

type LiquidityBuffer = {
  wrappedToken: ApiToken
  underlyingBalance: BigNumber
  wrappedBalance: BigNumber
  halfTotalLiquidityAsUnderlying: BigNumber
  maxDeposit: BigNumber
  maxWithdraw: BigNumber
}

type UnderlyingTokenWithAmount = ApiToken & { amount: BigNumber }

type ViolationCheckParams = {
  underlyingToken: UnderlyingTokenWithAmount
  liquidityBuffers: LiquidityBuffer[]
}

export function useBufferBalanceWarning(params: UseBufferBalanceWarningParams) {
  const { amounts, validTokens, operation } = params
  const isAddLiquidity = operation === 'add'

  const underlyingTokensWithAmount = amounts.flatMap(amount => {
    const underlyingToken = validTokens.find(
      t =>
        isSameAddress(t.address, amount.tokenAddress) &&
        t.wrappedToken &&
        t.useUnderlyingForAddRemove
    )
    if (!underlyingToken || !amount.humanAmount) return []
    return { ...underlyingToken, amount: bn(amount.humanAmount) }
  })

  const wrappedTokens = isAddLiquidity
    ? validTokens.filter(token => token.underlyingToken)
    : validTokens.map(token => token.wrappedToken).filter(token => token !== undefined)

  const { liquidityBuffers, isLoadingLiquidityBuffers } = useLiquidityBuffers(wrappedTokens)

  if (isLoadingLiquidityBuffers) return null

  const bufferLimitViolations = underlyingTokensWithAmount
    .map(underlyingToken => {
      return isAddLiquidity
        ? checkAddViolation({ underlyingToken, liquidityBuffers })
        : checkRemoveViolation({ underlyingToken, liquidityBuffers })
    })
    .filter(violation => violation !== null)

  if (bufferLimitViolations.length === 0) return null

  return bufferLimitViolations.map((underlyingToken, idx) => {
    const action = isAddLiquidity ? 'deposit' : 'withdrawal'
    const wrappedSymbol = underlyingToken.wrappedToken?.symbol
    const selectedTokenSymbol = isAddLiquidity ? wrappedSymbol : underlyingToken.symbol

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
              {!isAddLiquidity && ', which you can then unwrap later on the lending protocol'}.
            </Text>
          </>
        }
        key={idx}
        status="warning"
        title={`Insufficient buffer liquidity for your ${underlyingToken.symbol} ${action}`}
      />
    )
  })
}

function checkAddViolation(params: ViolationCheckParams): UnderlyingTokenWithAmount | null {
  const { underlyingToken, liquidityBuffers } = params
  const wrappedToken = underlyingToken.wrappedToken

  const liquidityBuffer = liquidityBuffers.find(b =>
    isSameAddress(b.wrappedToken.address, wrappedToken?.address)
  )

  if (!liquidityBuffer || !wrappedToken?.priceRate) return null

  // for add liquidity, user is adding underlying tokens to the buffer, which pulls from the wrapped balance
  const { halfTotalLiquidityAsUnderlying, wrappedBalance, maxDeposit } = liquidityBuffer

  // check if buffer has enough wrapped balance to cover the underlying amount user wants to add
  const underlyingAmountAsWrapped = underlyingToken.amount.div(bn(wrappedToken.priceRate))
  const exceedsWrappedBalance = underlyingAmountAsWrapped.gt(wrappedBalance)

  // if buffer does not have enough wrapped balance, it will hit 100% underlying and need erc4626 max deposit to be sufficient to rebalance to 50% underlying / 50% wrapped
  const wrappedBalanceAsUnderlying = wrappedBalance.times(bn(wrappedToken.priceRate))
  const depositAmountToRebalance = halfTotalLiquidityAsUnderlying.plus(
    underlyingToken.amount.minus(wrappedBalanceAsUnderlying)
  )
  const exceedsMaxDeposit = depositAmountToRebalance.gt(maxDeposit)

  if (exceedsWrappedBalance && exceedsMaxDeposit) return underlyingToken

  return null
}

function checkRemoveViolation(params: ViolationCheckParams): UnderlyingTokenWithAmount | null {
  const { underlyingToken, liquidityBuffers } = params

  const liquidityBuffer = liquidityBuffers.find(b =>
    isSameAddress(b.wrappedToken.underlyingToken?.address, underlyingToken.address)
  )

  if (!liquidityBuffer) return null

  // for remove liquidity, user is adding wrapped tokens to the buffer, which pulls from the underlying balance
  const { halfTotalLiquidityAsUnderlying, underlyingBalance, maxWithdraw } = liquidityBuffer

  // check if buffer has enough underlying balance to cover the underlying amount user wants to remove
  const exceedsBufferBalance = underlyingToken.amount.gt(underlyingBalance)

  // if buffer does not have enough underlying balance, it will hit 100% wrapped and need erc4626 max withdraw to be sufficient to rebalance buffer to 50% underlying / 50% wrapped
  const withdrawAmountToRebalance = halfTotalLiquidityAsUnderlying.plus(
    underlyingToken.amount.minus(underlyingBalance)
  )
  const exceedsMaxWithdraw = withdrawAmountToRebalance.gt(maxWithdraw)

  if (exceedsBufferBalance && exceedsMaxWithdraw) return underlyingToken

  return null
}

function useLiquidityBuffers(wrappedTokens: ApiToken[]) {
  const { data: bufferBalances, isLoading: isLoadingBufferBalances } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: vaultAdminAbi_V3,
      address: AddressProvider.Vault(token.chainId),
      functionName: 'getBufferBalance' as const,
      args: [token.address],
    })),
    query: { enabled: wrappedTokens.length > 0 },
  })

  const { data: maxDepositData, isLoading: isLoadingMaxDeposit } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: erc4626Abi,
      address: token.address as Address,
      functionName: 'maxDeposit' as const,
      args: [AddressProvider.Vault(token.chainId)],
    })),
  })

  const { data: maxWithdrawData, isLoading: isLoadingMaxWithdraw } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: erc4626Abi,
      address: token.address as Address,
      functionName: 'maxWithdraw' as const,
      args: [AddressProvider.Vault(token.chainId)],
    })),
  })

  const isLoadingLiquidityBuffers =
    isLoadingBufferBalances || isLoadingMaxDeposit || isLoadingMaxWithdraw

  const liquidityBuffers = wrappedTokens
    .map((wrappedToken, index) => {
      const underlyingDecimals = wrappedToken.underlyingToken?.decimals

      if (!underlyingDecimals || !wrappedToken.priceRate) return null

      const underlyingBalanceRaw = bufferBalances?.[index]?.result?.[0] ?? 0n
      const wrappedBalanceRaw = bufferBalances?.[index]?.result?.[1] ?? 0n

      const underlyingBalance = bn(formatUnits(underlyingBalanceRaw, underlyingDecimals))
      const wrappedBalance = bn(formatUnits(wrappedBalanceRaw, wrappedToken.decimals))
      const wrappedBalanceAsUnderlying = wrappedBalance.times(wrappedToken.priceRate)

      const totalLiquidityAsUnderlying = underlyingBalance.plus(wrappedBalanceAsUnderlying)
      const halfTotalLiquidityAsUnderlying = totalLiquidityAsUnderlying.div(2)

      const maxDepositRaw = maxDepositData?.[index]?.result ?? 0n
      const maxWithdrawRaw = maxWithdrawData?.[index]?.result ?? 0n
      const maxDeposit = bn(formatUnits(maxDepositRaw, underlyingDecimals))
      const maxWithdraw = bn(formatUnits(maxWithdrawRaw, underlyingDecimals))

      return {
        wrappedToken,
        underlyingBalance,
        wrappedBalance,
        halfTotalLiquidityAsUnderlying,
        maxDeposit,
        maxWithdraw,
      }
    })
    .filter(b => b !== null)

  return { liquidityBuffers, isLoadingLiquidityBuffers }
}

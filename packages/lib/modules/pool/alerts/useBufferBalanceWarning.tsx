import { HumanTokenAmountWithSymbol, ApiToken } from '@repo/lib/modules/tokens/token.types'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Text } from '@chakra-ui/react'
import { BalAlert } from '../../../shared/components/alerts/BalAlert'
import { useReadContracts } from 'wagmi'
import { vaultAdminAbi_V3, AddressProvider } from '@balancer/sdk'
import { formatUnits, erc4626Abi, Address } from 'viem'

import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type Props = {
  validTokens: ApiToken[]
  amounts: HumanTokenAmountWithSymbol[]
  operation: 'add' | 'remove'
}

type BufferLiquidityInfo = {
  underlyingTokenAddress: string | undefined
  wrappedTokenAddress: string
  bufferBalanceOfUnderlying: ReturnType<typeof bn>
  bufferBalanceOfWrapped: ReturnType<typeof bn>
  halfOfBufferTotalLiquidityAsUnderlying: ReturnType<typeof bn>
  halfOfBufferTotalLiquidityAsWrapped: ReturnType<typeof bn>
  vaultMaxDeposit: ReturnType<typeof bn>
  vaultMaxWithdraw: ReturnType<typeof bn>
}

type Violation = { underlyingSymbol: string | undefined; wrappedSymbol: string | undefined }

type ViolationCheckParams = {
  tokenAddress: Address
  humanAmount: string
  underlyingSymbol: string | undefined
  validTokens: ApiToken[]
  bufferLiquidityInfo: BufferLiquidityInfo[]
}

export function useBufferBalanceWarning({ amounts, validTokens, operation }: Props) {
  const isAddLiquidity = operation === 'add'

  const humanUnderlyingAmounts = amounts.filter(amount =>
    validTokens.some(
      token =>
        isSameAddress(token.address, amount.tokenAddress) &&
        token.wrappedToken &&
        token.useUnderlyingForAddRemove
    )
  )

  const wrappedTokens = isAddLiquidity
    ? validTokens.filter(token => token.underlyingToken)
    : validTokens.map(token => token.wrappedToken).filter(token => token !== undefined)

  const { bufferLiquidityInfo, isLoadingBufferBalances } = useBufferBalances(wrappedTokens)

  if (isLoadingBufferBalances) return null

  // validTokens always have symbol but amounts do not
  const underlyingAmounts = humanUnderlyingAmounts.map(({ tokenAddress, humanAmount }) => {
    const symbol = validTokens.find(token => isSameAddress(token.address, tokenAddress))?.symbol
    return { tokenAddress, humanAmount, symbol }
  })

  const bufferLimitViolations = underlyingAmounts
    .map(({ tokenAddress, humanAmount, symbol: underlyingSymbol }) => {
      const params = {
        tokenAddress,
        humanAmount,
        underlyingSymbol,
        validTokens,
        bufferLiquidityInfo,
      }
      return isAddLiquidity ? checkAddViolation(params) : checkRemoveViolation(params)
    })
    .filter(violation => violation !== null)

  if (bufferLimitViolations.length === 0) return null

  return bufferLimitViolations.map(({ underlyingSymbol, wrappedSymbol }, idx) => {
    const action = isAddLiquidity ? 'deposit' : 'withdrawal'
    const selectedTokenSymbol = isAddLiquidity ? wrappedSymbol : underlyingSymbol

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
        title={`Insufficient buffer liquidity for your ${underlyingSymbol} ${action}`}
      />
    )
  })
}

function checkAddViolation(params: ViolationCheckParams): Violation | null {
  // User is offering underlying tokens which requires sufficient buffer balance of wrapped tokens
  const { tokenAddress, humanAmount, underlyingSymbol, validTokens, bufferLiquidityInfo } = params

  const wrappedToken = validTokens.find(validToken =>
    isSameAddress(tokenAddress, validToken.underlyingToken?.address)
  )
  const bufferLiquidity = bufferLiquidityInfo.find(b =>
    isSameAddress(b.wrappedTokenAddress, wrappedToken?.address)
  )

  if (!bufferLiquidity || !wrappedToken || !wrappedToken.priceRate) return null

  const { bufferBalanceOfWrapped, halfOfBufferTotalLiquidityAsWrapped, vaultMaxDeposit } =
    bufferLiquidity

  const wrappedAmountRequired = bn(humanAmount).div(wrappedToken.priceRate)
  const exceedsBufferBalance = wrappedAmountRequired.gt(bufferBalanceOfWrapped)

  const exceedsVaultCapacity = vaultMaxDeposit.lt(
    halfOfBufferTotalLiquidityAsWrapped.plus(wrappedAmountRequired.minus(bufferBalanceOfWrapped))
  )

  if (exceedsBufferBalance && exceedsVaultCapacity) {
    return { underlyingSymbol, wrappedSymbol: wrappedToken.symbol }
  }

  return null
}

function checkRemoveViolation(params: ViolationCheckParams): Violation | null {
  const { tokenAddress, humanAmount, underlyingSymbol, validTokens, bufferLiquidityInfo } = params

  // User is requesting underlying tokens which requires sufficient buffer balance of underlying
  const underlyingToken = validTokens.find(validToken =>
    isSameAddress(tokenAddress, validToken.address)
  )
  const bufferLiquidity = bufferLiquidityInfo.find(b =>
    isSameAddress(b.underlyingTokenAddress, underlyingToken?.address)
  )

  if (!bufferLiquidity || !underlyingSymbol) return null

  const { halfOfBufferTotalLiquidityAsUnderlying, bufferBalanceOfUnderlying, vaultMaxWithdraw } =
    bufferLiquidity

  const underlyingAmountRequired = bn(humanAmount)
  const exceedsBufferBalance = underlyingAmountRequired.gt(bufferBalanceOfUnderlying)

  const exceedsVaultCapacity = vaultMaxWithdraw.lt(
    halfOfBufferTotalLiquidityAsUnderlying.plus(
      underlyingAmountRequired.minus(bufferBalanceOfUnderlying)
    )
  )

  if (exceedsBufferBalance && exceedsVaultCapacity) {
    const wrappedSymbol = underlyingToken?.wrappedToken?.symbol
    return { underlyingSymbol, wrappedSymbol }
  }

  return null
}

function useBufferBalances(wrappedTokens: ApiToken[]) {
  const { data: bufferBalanceData, isLoading: isLoadingBufferBalances } = useReadContracts({
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
      functionName: 'maxDeposit',
      args: [AddressProvider.Vault(token.chainId)],
    })),
  })

  const { data: maxWithdrawData, isLoading: isLoadingMaxWithdraw } = useReadContracts({
    contracts: wrappedTokens.map(token => ({
      chainId: token.chainId,
      abi: erc4626Abi,
      address: token.address as Address,
      functionName: 'maxWithdraw',
      args: [AddressProvider.Vault(token.chainId)],
    })),
  })

  const isLoading = isLoadingBufferBalances || isLoadingMaxDeposit || isLoadingMaxWithdraw

  const bufferLiquidityInfo = wrappedTokens
    .map((token, index) => {
      const underlyingDecimals = token.underlyingToken?.decimals
      const priceRate = token.priceRate
      if (!underlyingDecimals || !priceRate) return null

      const underlyingRaw = bufferBalanceData?.[index]?.result?.[0] ?? 0n
      const wrappedRaw = bufferBalanceData?.[index]?.result?.[1] ?? 0n

      const bufferBalanceOfUnderlying = bn(formatUnits(underlyingRaw, underlyingDecimals))
      const bufferBalanceOfWrapped = bn(formatUnits(wrappedRaw, token.decimals))

      const totalAsUnderlying = bufferBalanceOfUnderlying.plus(
        bufferBalanceOfWrapped.times(priceRate)
      )
      const halfTotalAsUnderlying = totalAsUnderlying.div(2)
      const halfTotalAsWrapped = halfTotalAsUnderlying.div(priceRate)

      return {
        underlyingTokenAddress: token.underlyingToken?.address,
        wrappedTokenAddress: token.address,
        bufferBalanceOfUnderlying,
        bufferBalanceOfWrapped,
        halfOfBufferTotalLiquidityAsUnderlying: halfTotalAsUnderlying,
        halfOfBufferTotalLiquidityAsWrapped: halfTotalAsWrapped,
        vaultMaxDeposit: bn(maxDepositData?.[index]?.result ?? 0n),
        vaultMaxWithdraw: bn(maxWithdrawData?.[index]?.result ?? 0n),
      }
    })
    .filter(b => b !== null)

  return { bufferLiquidityInfo, isLoadingBufferBalances: isLoading }
}

import { PoolCreationToken } from '../types'
import { useReadContracts } from 'wagmi'
import { erc4626Abi, parseUnits, Address } from 'viem'
import { isApiToken } from '../helpers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Params = {
  poolTokens: PoolCreationToken[]
  chain: GqlChain
}

export function useBoostUnderlyingSteps({ poolTokens, chain }: Params) {
  const { getToken } = useTokens()

  const poolTokensToBoost = poolTokens
    .filter(token => token.isBoostingUnderlying)
    .map(token => {
      if (
        !token.data ||
        !isApiToken(token.data) ||
        !token.data.underlyingTokenAddress ||
        !token.amount ||
        !token.address
      ) {
        throw new Error('missing requiried data for boosting underlying tokens')
      }

      return {
        wrappedTokenAddress: token.address,
        wrappedTokenAmountRaw: parseUnits(token.amount, token.data.decimals),
        underlyingTokenAddress: token.data.underlyingTokenAddress as Address,
      }
    })

  const underlyingAmountReads = poolTokensToBoost.map(
    ({ wrappedTokenAddress, wrappedTokenAmountRaw }) => ({
      address: wrappedTokenAddress,
      abi: erc4626Abi,
      functionName: 'previewMint' as const,
      args: [wrappedTokenAmountRaw],
    })
  )

  const { data: underlyingAmounts, isLoading: isLoadingUnderlyingAmounts } = useReadContracts({
    contracts: underlyingAmountReads,
    query: { enabled: poolTokensToBoost.length > 0 },
  })

  const tokenToSpender = Object.fromEntries(
    poolTokensToBoost.map(({ underlyingTokenAddress, wrappedTokenAddress }) => [
      underlyingTokenAddress,
      wrappedTokenAddress,
    ])
  ) as Record<Address, Address>

  const approvalAmounts = poolTokensToBoost.map(({ underlyingTokenAddress }, index) => ({
    address: underlyingTokenAddress,
    rawAmount: underlyingAmounts?.[index]?.result ?? 0n,
    symbol: getToken(underlyingTokenAddress, chain)?.symbol,
  }))

  const { steps: approvalSteps, isLoading: isLoadingApprovalSteps } = useTokenApprovalSteps({
    spenderAddress: (tokenAddress: Address) => tokenToSpender[tokenAddress],
    chain,
    approvalAmounts,
    actionType: 'Wrapping',
    enabled: poolTokensToBoost.length > 0 && !isLoadingUnderlyingAmounts,
  })

  // TODO: deposit into erc4626 steps

  const isLoading = isLoadingUnderlyingAmounts || isLoadingApprovalSteps
  const steps = [...approvalSteps]

  return { steps, isLoading }
}

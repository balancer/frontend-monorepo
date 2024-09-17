import { SupportedChainId } from '@/lib/config/config.types'
import { isNativeAsset } from '@/lib/shared/utils/addresses'
import { Address } from 'viem'
import { MAX_BIGINT } from '@/lib/shared/utils/numbers'
import { InputAmount } from '@balancer/sdk'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { requiresDoubleApproval } from '../token.helpers'

export type TokenAmountToApprove = {
  tokenAddress: Address
  requiredRawAmount: bigint // actual amount that the transaction requires
  requestedRawAmount: bigint // amount that we are going to request (normally MAX_BIGINT)
}

// This is a subtype of InputAmount as we only need rawAmount and address
export type RawAmount = Pick<InputAmount, 'address' | 'rawAmount'>

type TokenApprovalParams = {
  chainId: GqlChain | SupportedChainId | null
  rawAmounts: RawAmount[]
  allowanceFor: (tokenAddress: Address) => bigint
  approveMaxBigInt?: boolean
  skipAllowanceCheck?: boolean
}

/*
  Filters the given list of amountsToApprove discarding those that do not need approval
*/
export function getRequiredTokenApprovals({
  chainId,
  rawAmounts,
  allowanceFor,
  approveMaxBigInt = true,
  skipAllowanceCheck = false,
}: TokenApprovalParams): TokenAmountToApprove[] {
  if (!chainId) return []
  if (skipAllowanceCheck) return []

  let tokenAmountsToApprove: TokenAmountToApprove[] = rawAmounts.map(({ address, rawAmount }) => {
    return {
      tokenAddress: address,
      requiredRawAmount: rawAmount,
      // The transaction only requires requiredRawAmount but we will normally request MAX_BIGINT
      requestedRawAmount: approveMaxBigInt ? MAX_BIGINT : rawAmount,
    }
  })

  tokenAmountsToApprove = tokenAmountsToApprove.filter(
    ({ tokenAddress }) => !isNativeAsset(chainId, tokenAddress)
  )

  /**
   * Some tokens (e.g. USDT) require setting their approval amount to 0n before being
   * able to adjust the value up again (only when there was an existing allowance)
   */
  return tokenAmountsToApprove.flatMap(t => {
    if (isDoubleApprovalRequired(chainId, t.tokenAddress, allowanceFor)) {
      const zeroTokenAmountToApprove: TokenAmountToApprove = {
        requiredRawAmount: 0n,
        requestedRawAmount: 0n,
        tokenAddress: t.tokenAddress,
      }
      // Prepend approval for ZERO amount
      return [zeroTokenAmountToApprove, t]
    }
    return t
  })
}

/**
 * Some tokens require setting their approval amount to 0 first before being
 * able to adjust the value up again. This returns true for tokens that requires
 * this and false otherwise.
 */
function isDoubleApprovalRequired(
  chainId: GqlChain | SupportedChainId,
  tokenAddress: Address,
  allowanceFor: (tokenAddress: Address) => bigint
): boolean {
  return !!(requiresDoubleApproval(chainId, tokenAddress) && allowanceFor(tokenAddress) > 0n)
}

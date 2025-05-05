import { SupportedChainId } from '@repo/lib/config/config.types'
import { isNativeAsset } from '@repo/lib/shared/utils/addresses'
import { Address } from 'viem'
import { MAX_BIGINT } from '@repo/lib/shared/utils/numbers'
import { InputAmount } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { requiresDoubleApproval } from '../token.helpers'

export type TokenAmountToApprove = {
  tokenAddress: Address
  requiredRawAmount: bigint // actual amount that the transaction requires
  requestedRawAmount: bigint // amount that we are going to request (normally MAX_BIGINT)
  isPermit2: boolean // whether the approval is for Permit2 or standard token approval
  symbol: string // token symbol to be displayed in the approval steps
}

// This is a subtype of InputAmount as we only need rawAmount and address
export type RawAmount = Pick<InputAmount, 'address' | 'rawAmount'> & { symbol?: string }

type TokenApprovalParams = {
  chainId: GqlChain | SupportedChainId | null
  rawAmounts: RawAmount[]
  allowanceFor: (tokenAddress: Address) => bigint
  isPermit2?: boolean
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
  isPermit2 = false,
  approveMaxBigInt = true,
  skipAllowanceCheck = false,
}: TokenApprovalParams): TokenAmountToApprove[] {
  if (!chainId) return []
  if (skipAllowanceCheck) return []

  let tokenAmountsToApprove: TokenAmountToApprove[] = rawAmounts.map(
    ({ address, rawAmount, symbol }) => {
      return {
        tokenAddress: address,
        requiredRawAmount: rawAmount,
        // The transaction only requires requiredRawAmount but we will normally request MAX_BIGINT
        requestedRawAmount: approveMaxBigInt ? MAX_BIGINT : rawAmount,
        isPermit2,
        symbol: symbol || 'Unknown',
      }
    }
  )

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
        isPermit2,
        symbol: t.symbol,
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

export function areEmptyRawAmounts(amountsIn: RawAmount[]) {
  return !amountsIn || amountsIn.length === 0 || amountsIn.every(amount => amount.rawAmount === 0n)
}

export function isTheApprovedAmountEnough(
  tokenAllowance: bigint,
  requiredRawAmount: bigint,
  isApprovingZeroForDoubleApproval: boolean,
  nextTokenToApprove?: TokenAmountToApprove
) {
  if (isApprovingZeroForDoubleApproval && nextTokenToApprove) {
    // Edge case USDT case is completed if:
    // - The allowance is 0n
    // - The allowance is greater than the required amount (of the next step)
    return tokenAllowance === 0n || tokenAllowance >= nextTokenToApprove.requiredRawAmount
  }

  const isAllowed = tokenAllowance >= requiredRawAmount
  return requiredRawAmount > 0n && isAllowed
}

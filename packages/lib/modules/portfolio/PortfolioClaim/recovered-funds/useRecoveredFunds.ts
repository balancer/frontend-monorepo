import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useQuery } from '@tanstack/react-query'
import { MerklReward, MerklRewardsResponse } from '../../merkl/merkl.types'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { Address } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { HumanAmount } from '@balancer/sdk'
import { useState } from 'react'
import { NORMALIZED_WRAPPER_TOKENS } from './wrapper-tokens'

const MERKL_API_URL = 'https://api.merkl.xyz/v4'
export const CHAINS = [
  1 /* Mainnet*/, 42161 /* Arbitrum */, 8453 /* Base */, 137 /* Polygon */, 10 /* Optimism */,
]

export type RecoveredTokenClaim = {
  amount: HumanTokenAmountWithSymbol
  chainId: number
  price: number
  proofs: string[]
  rawAmount: bigint
  claimedAmount: bigint
}

export function useRecoveredFunds() {
  const { userAddress } = useUserAccount()
  const [lastClaimedChain, setLastClaimedChain] = useState<number | undefined>()

  const result = useQuery({
    queryKey: ['fetch-recovered-funds', lastClaimedChain],
    queryFn: async () => {
      const chains = CHAINS.join(',')
      const reloadChainId = lastClaimedChain ? `&reloadChainId=${lastClaimedChain}` : ''
      const endpoint = `${MERKL_API_URL}/users/${userAddress}/rewards?chainId=${chains}${reloadChainId}&test=true`
      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(
          `Unable to fetch recovered funds claim data
          from Merkl API: ${await response.text()} (${response.status})`
        )
      }

      return (await response.json()) as MerklRewardsResponse
    },
    enabled: !!userAddress,
  })

  const claims =
    !result.isLoading && result.data
      ? result.data
          .flatMap(chain => chain.rewards)
          .map(toRecoveredTokenClaim)
          .filter(claim =>
            NORMALIZED_WRAPPER_TOKENS[claim.chainId].includes(
              claim.amount.tokenAddress.toLowerCase()
            )
          )
      : []

  const hasBeenClaimed = claims.every(claim => claim.rawAmount === claim.claimedAmount)

  return {
    hasRecoveredFunds: claims.length > 0 && !hasBeenClaimed,
    refetchClaims: (chainId: number) => {
      setLastClaimedChain(chainId)
      result.refetch()
    },
    claims,
  }
}

function toRecoveredTokenClaim(item: MerklReward): RecoveredTokenClaim {
  return {
    amount: {
      humanAmount: bn(item.amount).shiftedBy(-item.token.decimals).toString() as HumanAmount,
      tokenAddress: item.token.address as Address,
      symbol: item.token.symbol,
    },
    chainId: item.token.chainId,
    price: item.token.price || 0,
    proofs: item.proofs,
    rawAmount: BigInt(item.amount),
    claimedAmount: BigInt(item.claimed),
  }
}

export function sumRecoveredFundsTotal(claims: RecoveredTokenClaim[]) {
  return claims.reduce((acc, claim) => {
    return bn(claim.amount.humanAmount).times(claim.price).plus(acc).toNumber()
  }, 0)
}

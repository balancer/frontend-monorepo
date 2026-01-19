import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useQuery } from '@tanstack/react-query'
import { MerklReward, MerklRewardsResponse } from '../../merkl/merkl.types'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { Address } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { HumanAmount } from '@balancer/sdk'

const MERKL_API_URL = 'https://api.merkl.xyz/v4'
const CHAINS = [1]

export type RecoveredTokenClaim = {
  amount: HumanTokenAmountWithSymbol
  chainId: number
  price: number
}

export function useRecoveredFunds() {
  const { userAddress } = useUserAccount()

  const result = useQuery({
    queryKey: ['fetch-recovered-funds'],
    queryFn: async () => {
      //
      const chains = CHAINS.join(',')
      const endpoint = `${MERKL_API_URL}/users/${userAddress}/rewards?chainId=${chains}&test=true`
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
          .filter(claim => Number(claim.claimed) < Number(claim.amount))
          .map(toRecoveredTokenClaim)
      : []

  return {
    hasRecoveredFunds: claims.length > 0,
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
  }
}

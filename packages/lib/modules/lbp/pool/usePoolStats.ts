import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { usePriceInfo } from './usePriceInfo'
import { useTokenMetadata } from '../../tokens/useTokenMetadata'

const emptyStats = {
  isLoading: true,
  fundsRaised: 0,
  marketCap: 0,
  fdv: 0,
  tvl: 0,
  totalVolume: 0,
  totalFees: 0,
}

export function usePoolStats(pool: GqlPoolLiquidityBootstrappingV3) {
  const { isLoading: metadataIsLoading, totalSupply } = useTokenMetadata(
    pool.projectToken,
    pool.chain
  )

  const { isLoading: snapshotsAreLoading, snapshots } = usePriceInfo(pool.chain, pool.id as Address)
  if (snapshotsAreLoading || metadataIsLoading) return emptyStats
  const firstSnapshot = snapshots[0]
  const lastSnapshot = snapshots[snapshots.length - 1]

  return {
    isLoading: snapshotsAreLoading || metadataIsLoading,
    fundsRaised:
      (lastSnapshot.reserveTokenBalance - firstSnapshot.reserveTokenBalance) *
      lastSnapshot.reserveTokenPrice,
    marketCap: firstSnapshot.projectTokenBalance * lastSnapshot.projectTokenPrice,
    fdv: lastSnapshot.projectTokenPrice * (totalSupply || 0),
    tvl: lastSnapshot?.tvl || 0,
    totalVolume: lastSnapshot?.cumulativeVolume || 0,
    totalFees: lastSnapshot?.cumulativeFees || 0,
  }
}

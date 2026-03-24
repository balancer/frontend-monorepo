import { Address } from 'viem'
import { usePriceInfo } from './usePriceInfo'
import { useTokenMetadata } from '../../tokens/useTokenMetadata'
import { LbpV3 } from '@repo/lib/modules/pool/pool.types'
import { isFixedLBP } from '@repo/lib/modules/pool/pool.helpers'

const emptyStats = {
  isLoading: true,
  fundsRaised: 0,
  marketCap: 0,
  fdv: 0,
  tvl: 0,
  totalVolume: 0,
  totalFees: 0,
}

export function usePoolStats(pool: LbpV3) {
  const { isLoading: metadataIsLoading, totalSupply } = useTokenMetadata(
    pool.projectToken,
    pool.chain
  )

  const { isLoading: snapshotsAreLoading, snapshots } = usePriceInfo(
    pool.chain,
    pool.id as Address,
    isFixedLBP(pool)
  )
  if (snapshotsAreLoading || metadataIsLoading) return emptyStats
  const firstSnapshot = snapshots[0]
  const lastSnapshot = snapshots[snapshots.length - 1]
  const hasSnapshots = snapshots.length > 0

  return {
    isLoading: snapshotsAreLoading || metadataIsLoading,
    fundsRaised: hasSnapshots
      ? (lastSnapshot.reserveTokenBalance - firstSnapshot.reserveTokenBalance) *
        lastSnapshot.reserveTokenPrice
      : 0,
    marketCap: hasSnapshots
      ? firstSnapshot.projectTokenBalance * lastSnapshot.projectTokenPrice
      : 0,
    fdv: (lastSnapshot?.projectTokenPrice || 0) * (totalSupply || 0),
    tvl: lastSnapshot?.tvl || 0,
    totalVolume: lastSnapshot?.cumulativeVolume || 0,
    totalFees: lastSnapshot?.cumulativeFees || 0,
  }
}

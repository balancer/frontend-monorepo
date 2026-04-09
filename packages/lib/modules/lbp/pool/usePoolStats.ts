import { Address } from 'viem'
import { getCurrentPrice, usePriceInfo } from './usePriceInfo'
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

  if (snapshotsAreLoading || metadataIsLoading || snapshots.length === 0) return emptyStats
  const firstSnapshot = snapshots[0]
  const lastSnapshot = snapshots[snapshots.length - 1]
  const currentPrice = getCurrentPrice(snapshots)

  return {
    isLoading: snapshotsAreLoading || metadataIsLoading,
    fundsRaised:
      (lastSnapshot.reserveTokenBalance - firstSnapshot.reserveTokenBalance) *
      lastSnapshot.reserveTokenPrice,
    marketCap: firstSnapshot.projectTokenBalance * currentPrice,
    fdv: currentPrice * (totalSupply || 0),
    tvl: lastSnapshot?.tvl || 0,
    totalVolume: lastSnapshot?.cumulativeVolume || 0,
    totalFees: lastSnapshot?.cumulativeFees || 0,
  }
}

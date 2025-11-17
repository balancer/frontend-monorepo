import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { formatUnits } from 'viem'
import { useGetPendingReward } from '../hooks/useGetPendingReward'
import { useReliquary } from '../ReliquaryProvider'

interface PendingReward {
  address: string
  amount: string
}

export function useRelicPendingRewards() {
  const { selectedRelic } = useReliquary()
  const config = useNetworkConfig()
  const beetsAddress = config.tokens.addresses.beets

  const query = useGetPendingReward(GqlChain.Sonic, selectedRelic?.relicId)

  const data: PendingReward[] =
    query.amount && beetsAddress
      ? [{ address: beetsAddress, amount: formatUnits(query.amount, 18) }]
      : []

  return {
    data,
    refetch: query.refetch,
    isLoading: query.isLoading,
  }
}

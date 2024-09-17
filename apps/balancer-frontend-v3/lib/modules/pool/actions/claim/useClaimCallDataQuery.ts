import { useQuery } from '@tanstack/react-query'
import { Address, Hex } from 'viem'
import { GaugeService } from '@/lib/shared/services/staking/gauge.service'
import { useMemo } from 'react'

export function useClaimCallDataQuery({
  claimRewardGauges,
  mintBalRewardGauges,
  gaugeService,
  enabled = true,
}: {
  claimRewardGauges: Address[]
  mintBalRewardGauges: Address[]
  gaugeService: GaugeService | undefined
  enabled?: boolean
}) {
  const allGauges = useMemo(() => {
    return [...claimRewardGauges, ...mintBalRewardGauges]
  }, [claimRewardGauges, mintBalRewardGauges])

  const queryKey = ['claim', 'gauge', 'callData', allGauges]

  const queryFn = (): `0x${string}`[] => {
    if (!gaugeService) return []

    const calls: Hex[] = []

    if (claimRewardGauges.length > 0) {
      const claimRewardsCallData = gaugeService.getGaugeEncodeClaimRewardsCallData({
        gauges: claimRewardGauges,
      })
      calls.push(claimRewardsCallData)
    }

    if (mintBalRewardGauges.length > 0) {
      const mintCallData = gaugeService.getGaugeEncodeMintCallData({
        gauges: mintBalRewardGauges,
        outputReference: 0n,
      })
      calls.push(mintCallData)
    }

    return calls
  }

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && gaugeService && allGauges.length > 0,
  })

  return {
    ...query,
    data: query.data || [],
  }
}

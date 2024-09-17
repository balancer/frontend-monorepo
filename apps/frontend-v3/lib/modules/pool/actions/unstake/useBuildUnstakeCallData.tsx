import { GaugeService } from '@/lib/shared/services/staking/gauge.service'
import { Address, Hex } from 'viem'

type Params = {
  amount: bigint
  gaugeService: GaugeService | undefined
  gauges: Address[]
  hasUnclaimedNonBalRewards: boolean
  hasUnclaimedBalRewards: boolean
  userAddress: Address
}
export function useBuildUnstakeCallData({
  amount,
  gaugeService,
  gauges,
  hasUnclaimedNonBalRewards,
  hasUnclaimedBalRewards,
  userAddress,
}: Params): Hex[] {
  if (!amount) return []
  if (!gaugeService) return []
  if (!userAddress) return []

  const inputData = {
    hasUnclaimedNonBalRewards,
    hasUnclaimedBalRewards,
    gauges,
    sender: userAddress || '',
    recipient: userAddress || '',
    amount,
    outputReference: 0n,
  }

  return gaugeService.getGaugeClaimRewardsAndWithdrawContractCallData(inputData)
}

import { Address, Hex } from 'viem'
import { BatchRelayerService } from '../batch-relayer/batch-relayer.service'
import {
  EncodeGaugeClaimRewardsInput,
  EncodeGaugeMintInput,
  EncodeGaugeWithdrawInput,
} from '../batch-relayer/relayer-types'

interface ClaimCallDataArgs {
  hasUnclaimedNonBalRewards: boolean
  hasUnclaimedBalRewards: boolean
  gauges: Address[]
  outputReference: bigint
}

interface ClaimAndWithdrawCallDataArgs extends ClaimCallDataArgs {
  sender: Address
  recipient: Address
  amount: bigint
}

export class GaugeService {
  constructor(private readonly batchRelayerService: BatchRelayerService) {}

  public getGaugeClaimRewardsAndWithdrawContractCallData({
    hasUnclaimedNonBalRewards,
    hasUnclaimedBalRewards,
    gauges,
    sender,
    recipient,
    amount,
    outputReference,
  }: ClaimAndWithdrawCallDataArgs) {
    const calls: Hex[] = []

    const rewardsCalls = this.getGaugeClaimRewardsContractCallData({
      hasUnclaimedNonBalRewards,
      hasUnclaimedBalRewards,
      gauges,
      outputReference,
    })

    if (rewardsCalls.length) {
      calls.push(...rewardsCalls)
    }

    const gauge = gauges[0]

    if (gauge) {
      calls.push(this.getGaugeEncodeWithdrawCallData({ gauge, sender, recipient, amount }))
    }

    return calls
  }

  public getGaugeClaimRewardsContractCallData({
    hasUnclaimedNonBalRewards,
    hasUnclaimedBalRewards,
    gauges,
    outputReference,
  }: ClaimCallDataArgs) {
    const calls: Hex[] = []

    if (hasUnclaimedNonBalRewards) {
      calls.push(this.getGaugeEncodeClaimRewardsCallData({ gauges }))
    }

    if (hasUnclaimedBalRewards) {
      calls.push(this.getGaugeEncodeMintCallData({ gauges, outputReference }))
    }

    return calls
  }

  private getGaugeEncodeWithdrawCallData({
    gauge,
    sender,
    recipient,
    amount,
  }: EncodeGaugeWithdrawInput): Hex {
    return this.batchRelayerService.gaugeEncodeWithdraw({ gauge, sender, recipient, amount })
  }

  public getGaugeEncodeClaimRewardsCallData({ gauges }: EncodeGaugeClaimRewardsInput): Hex {
    return this.batchRelayerService.gaugeEncodeClaimRewards({ gauges })
  }

  public getGaugeEncodeMintCallData({ gauges, outputReference }: EncodeGaugeMintInput): Hex {
    return this.batchRelayerService.gaugeEncodeMint({ gauges, outputReference })
  }
}

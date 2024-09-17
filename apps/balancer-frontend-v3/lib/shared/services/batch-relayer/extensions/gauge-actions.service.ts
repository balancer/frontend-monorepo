import { encodeFunctionData, Hex } from 'viem'
import { balancerV2BatchRelayerLibraryAbi } from '@/lib/modules/web3/contracts/abi/generated'
import {
  EncodeGaugeClaimRewardsInput,
  EncodeGaugeDepositInput,
  EncodeGaugeMintInput,
  EncodeGaugeWithdrawInput,
} from '../relayer-types'

export class GaugeActionsService {
  public encodeDeposit(params: EncodeGaugeDepositInput): Hex {
    return encodeFunctionData({
      abi: balancerV2BatchRelayerLibraryAbi,
      functionName: 'gaugeDeposit',
      args: [params.gauge, params.sender, params.recipient, params.amount],
    })
  }

  public encodeWithdraw(params: EncodeGaugeWithdrawInput): Hex {
    return encodeFunctionData({
      abi: balancerV2BatchRelayerLibraryAbi,
      functionName: 'gaugeWithdraw',
      args: [params.gauge, params.sender, params.recipient, params.amount],
    })
  }

  public encodeClaimRewards(params: EncodeGaugeClaimRewardsInput): Hex {
    return encodeFunctionData({
      abi: balancerV2BatchRelayerLibraryAbi,
      functionName: 'gaugeClaimRewards',
      args: [params.gauges],
    })
  }

  public encodeMint(params: EncodeGaugeMintInput): Hex {
    return encodeFunctionData({
      abi: balancerV2BatchRelayerLibraryAbi,
      functionName: 'gaugeMint',
      args: [params.gauges, params.outputReference],
    })
  }
}

export const gaugeActionsService = new GaugeActionsService()

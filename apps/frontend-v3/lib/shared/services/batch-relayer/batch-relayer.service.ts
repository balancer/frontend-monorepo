import {
  EncodeGaugeClaimRewardsInput,
  EncodeGaugeDepositInput,
  EncodeGaugeMintInput,
  EncodeGaugeWithdrawInput,
} from './relayer-types'
import { GaugeActionsService } from './extensions/gauge-actions.service'
import { balancerV2BatchRelayerLibraryAbi } from '@/lib/modules/web3/contracts/abi/generated'
import { encodeFunctionData, Hex } from 'viem'

export class BatchRelayerService {
  constructor(
    public readonly batchRelayerAddress: string,
    private readonly gaugeActionsService: GaugeActionsService
  ) {}

  public encodePeekChainedReferenceValue(reference: bigint): string {
    return encodeFunctionData({
      abi: balancerV2BatchRelayerLibraryAbi,
      functionName: 'peekChainedReferenceValue',
      args: [reference],
    })
  }

  public gaugeEncodeDeposit(params: EncodeGaugeDepositInput): Hex {
    return this.gaugeActionsService.encodeDeposit(params)
  }

  public gaugeEncodeWithdraw(params: EncodeGaugeWithdrawInput): Hex {
    return this.gaugeActionsService.encodeWithdraw(params)
  }

  public gaugeEncodeClaimRewards(params: EncodeGaugeClaimRewardsInput): Hex {
    return this.gaugeActionsService.encodeClaimRewards(params)
  }

  public gaugeEncodeMint(params: EncodeGaugeMintInput): Hex {
    return this.gaugeActionsService.encodeMint(params)
  }
}

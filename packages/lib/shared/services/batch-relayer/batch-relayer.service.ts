import {
  EncodeExitPoolInput,
  EncodeGaugeClaimRewardsInput,
  EncodeGaugeDepositInput,
  EncodeGaugeMintInput,
  EncodeGaugeWithdrawInput,
  EncodeJoinPoolInput,
} from './relayer-types'
import { gaugeActionsService, GaugeActionsService } from './extensions/gauge-actions.service'
import { balancerV2BatchRelayerLibraryAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { encodeFunctionData, Hex } from 'viem'
import { vaultActionsService, VaultActionsService } from './extensions/vault-actions.service'

export class BatchRelayerService {
  constructor(
    public readonly batchRelayerAddress: string,
    protected readonly gaugeActionsService: GaugeActionsService,
    protected readonly vaultActionsService: VaultActionsService
  ) {}

  static create(batchRelayerAddress: string): BatchRelayerService {
    return new BatchRelayerService(batchRelayerAddress, gaugeActionsService, vaultActionsService)
  }

  public encodePeekChainedReferenceValue(reference: bigint): Hex {
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

  public vaultEncodeJoinPool(params: EncodeJoinPoolInput): string {
    return this.vaultActionsService.encodeJoinPool(params)
  }

  public vaultEncodeExitPool(params: EncodeExitPoolInput): string {
    return this.vaultActionsService.encodeExitPool(params)
  }
}

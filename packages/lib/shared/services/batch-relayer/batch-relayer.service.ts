import {
  EncodeGaugeClaimRewardsInput,
  EncodeGaugeDepositInput,
  EncodeGaugeMintInput,
  EncodeGaugeWithdrawInput,
  EncodeJoinPoolInput,
  EncodeReliquaryCreateRelicAndDepositInput,
  EncodeReliquaryDepositInput,
} from './relayer-types'
import { gaugeActionsService, GaugeActionsService } from './extensions/gauge-actions.service'
import { balancerV2BatchRelayerLibraryAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { encodeFunctionData, Hex } from 'viem'
import {
  reliquaryActionsService,
  ReliquaryActionsService,
} from './extensions/reliquary-actions.service'
import { vaultActionsService, VaultActionsService } from './extensions/vault-actions.service'

export class BatchRelayerService {
  constructor(
    public readonly batchRelayerAddress: string,
    private readonly gaugeActionsService: GaugeActionsService,
    private readonly vaultActionsService: VaultActionsService,
    private readonly reliquaryActionsService?: ReliquaryActionsService
  ) {}

  static create(batchRelayerAddress: string, includeReliquary = false): BatchRelayerService {
    return new BatchRelayerService(
      batchRelayerAddress,
      gaugeActionsService,
      vaultActionsService,
      includeReliquary ? reliquaryActionsService : undefined
    )
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

  public reliquaryEncodeCreateRelicAndDeposit(
    params: EncodeReliquaryCreateRelicAndDepositInput
  ): Hex {
    if (!this.reliquaryActionsService) {
      throw new Error('ReliquaryActionsService not initialized')
    }
    return this.reliquaryActionsService.encodeCreateRelicAndDeposit(params)
  }

  public reliquaryEncodeDeposit(params: EncodeReliquaryDepositInput): Hex {
    if (!this.reliquaryActionsService) {
      throw new Error('ReliquaryActionsService not initialized')
    }
    return this.reliquaryActionsService.encodeDeposit(params)
  }

  // public reliquaryEncodeWithdrawAndHarvest(params: EncodeReliquaryWithdrawAndHarvestInput) {
  //   return this.reliquaryActionsService.encodeWithdrawAndHarvest(params)
  // }

  // public reliquaryEncodeHarvestAll(params: EncodeReliquaryHarvestAllInput) {
  //   return this.reliquaryActionsService.encodeHarvestAll(params)
  // }

  public vaultEncodeJoinPool(params: EncodeJoinPoolInput): string {
    return this.vaultActionsService.encodeJoinPool(params)
  }
}

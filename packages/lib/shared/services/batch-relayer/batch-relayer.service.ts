import {
  EncodeGaugeClaimRewardsInput,
  EncodeGaugeDepositInput,
  EncodeGaugeMintInput,
  EncodeGaugeWithdrawInput,
  EncodeJoinPoolInput,
  EncodeReliquaryCreateRelicAndDepositInput,
  EncodeReliquaryDepositInput,
} from './relayer-types'
import { GaugeActionsService } from './extensions/gauge-actions.service'
import { balancerV2BatchRelayerLibraryAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { Address, encodeFunctionData, Hex, PublicClient } from 'viem'
import { ReliquaryActionsService } from './extensions/reliquary-actions.service'
import { VaultActionsService } from './extensions/vault-actions.service'
import { balancerV2BalancerRelayerV6Abi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'

export class BatchRelayerService {
  constructor(
    public readonly batchRelayerAddress: string,
    private readonly gaugeActionsService: GaugeActionsService,
    private readonly reliquaryActionsService: ReliquaryActionsService,
    private readonly vaultActionsService: VaultActionsService
  ) {}

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
    return this.reliquaryActionsService.encodeCreateRelicAndDeposit(params)
  }

  public reliquaryEncodeDeposit(params: EncodeReliquaryDepositInput): Hex {
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

  public async simulateMulticall({
    userAddress,
    calls,
    client,
  }: {
    userAddress: Address
    calls: Hex[]
    client: PublicClient
  }): Promise<Hex[]> {
    const { result } = await client.simulateContract({
      address: this.batchRelayerAddress as Address,
      abi: balancerV2BalancerRelayerV6Abi,
      functionName: 'multicall',
      args: [calls],
      account: userAddress,
    })

    return [...result]
  }
}

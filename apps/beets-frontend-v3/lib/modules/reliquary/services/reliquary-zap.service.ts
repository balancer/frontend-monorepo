import { AddLiquidityKind, HumanAmount, WeightedEncoder } from '@balancer/sdk'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Address, Hex, PublicClient, parseUnits } from 'viem'
import networkConfig from '@repo/lib/config/networks/sonic'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export class ReliquaryZapService {
  constructor(
    private readonly batchRelayerService: BatchRelayerService,
    private readonly client: PublicClient
  ) {}

  //join pool with beets/ftm -> deposit bpt into relic (create relic if no id provided)
  public async getReliquaryDepositContractCallData({
    userAddress,
    beetsAmount,
    stsAmount,
    slippage,
    relicId,
  }: {
    userAddress: Address
    beetsAmount: HumanAmount
    stsAmount: HumanAmount
    slippage: string
    relicId?: number
  }): Promise<string[]> {
    const beetsAmountScaled = parseUnits(beetsAmount, 18)
    const stsAmountScaled = parseUnits(stsAmount, 18)

    const joinNewFbeets = this.getReliquaryFbeetsJoinCallData({
      userAddress,
      maxAmountsIn: [stsAmountScaled, beetsAmountScaled],
      //this is set to 0 for the peek
      minimumBpt: 0n,
      outputReference: this.batchRelayerService.toPersistentChainedReference(0),
      fromInternalBalance: false,
    })

    const relicDepositOrCreateAndDeposit = this.getRelicDepositOrCreateAndDeposit({
      userAddress,
      relicId,
      amount: this.batchRelayerService.toPersistentChainedReference(0),
    })

    const peekJoinNewFbeetsBpt = this.batchRelayerService.encodePeekChainedReferenceValue(
      this.batchRelayerService.toPersistentChainedReference(0)
    )

    const [, newFbeetsBptAmountOut] = await this.batchRelayerService.simulateMulticall({
      userAddress,
      calls: [joinNewFbeets, peekJoinNewFbeetsBpt],
      client: this.client,
    })

    //below we use the output value of the peek to set min bpt amount
    return [
      this.getReliquaryFbeetsJoinCallData({
        userAddress,
        maxAmountsIn: [stsAmountScaled, beetsAmountScaled],
        minimumBpt: BigInt(
          bn(newFbeetsBptAmountOut).minus(bn(newFbeetsBptAmountOut).times(slippage)).toFixed(0)
        ),
        outputReference: this.batchRelayerService.toPersistentChainedReference(0),
        fromInternalBalance: true,
      }),
      relicDepositOrCreateAndDeposit,
    ]
  }

  private getReliquaryFbeetsJoinCallData({
    userAddress,
    maxAmountsIn,
    outputReference,
    fromInternalBalance,
    minimumBpt,
  }: {
    userAddress: Address
    outputReference: bigint
    maxAmountsIn: bigint[]
    fromInternalBalance: boolean
    minimumBpt: bigint
  }) {
    return this.batchRelayerService.vaultEncodeJoinPool({
      poolId: PROJECT_CONFIG.corePoolId as Hex,
      poolKind: 0,
      sender: userAddress,
      recipient: networkConfig.contracts.balancer.relayerV6,
      joinPoolRequest: {
        assets: [
          networkConfig.tokens.addresses.beets || '0x',
          networkConfig.tokens.stakedAsset?.address || '0x',
        ],
        userData: WeightedEncoder.encodeAddLiquidityUserData(AddLiquidityKind.Proportional, {
          maxAmountsIn,
          maxAmountsInWithoutBpt: maxAmountsIn,
          tokenInIndex: undefined,
          minimumBpt,
        }),
        maxAmountsIn,
        fromInternalBalance,
      },
      value: 0n,
      outputReference,
    }) as Hex
  }

  private getRelicDepositOrCreateAndDeposit({
    userAddress,
    relicId,
    amount,
  }: {
    userAddress: Address
    relicId?: number
    amount: bigint
  }) {
    return relicId && typeof relicId !== undefined
      ? this.batchRelayerService.reliquaryEncodeDeposit({
          sender: networkConfig.contracts.balancer.relayerV6,
          token: '0x10ac2F9DaE6539E77e372aDB14B1BF8fBD16b3e8', // TODO: add to config
          relicId: BigInt(relicId),
          amount,
          outputReference: 0n,
        })
      : this.batchRelayerService.reliquaryEncodeCreateRelicAndDeposit({
          sender: networkConfig.contracts.balancer.relayerV6,
          recipient: userAddress,
          token: '0x10ac2F9DaE6539E77e372aDB14B1BF8fBD16b3e8', // TODO: add to config
          poolId: 0n, // TODO: add to config?
          amount,
          outputReference: 0n,
        })
  }
}

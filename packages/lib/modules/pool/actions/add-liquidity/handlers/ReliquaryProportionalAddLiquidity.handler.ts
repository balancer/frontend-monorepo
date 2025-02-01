import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import {
  AddLiquidity,
  AddLiquidityKind,
  HumanAmount,
  Relayer,
  Slippage,
  WeightedEncoder,
} from '@balancer/sdk'
import { SdkBuildAddLiquidityInput } from '../add-liquidity.types'
import { BaseProportionalAddLiquidityHandler } from './BaseProportionalAddLiquidity.handler'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { Address, encodeFunctionData, Hex } from 'viem'
import networkConfig from '@repo/lib/config/networks/sonic'
import { Pool } from '../../../pool.types'
import { balancerV2BalancerRelayerV6Abi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export class ReliquaryProportionalAddLiquidityHandler extends BaseProportionalAddLiquidityHandler {
  constructor(
    pool: Pool,
    private readonly batchRelayerService: BatchRelayerService
  ) {
    super(pool)
  }

  public async buildCallData({
    account,
    queryOutput,
    slippagePercent,
    relicId,
  }: SdkBuildAddLiquidityInput & { relicId?: number }): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidity()

    // simulate add liquidity to get maxAmountsIn and minBptOut
    const call = addLiquidity.buildCall({
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(slippagePercent as HumanAmount),
      sender: account,
      recipient: networkConfig.contracts.balancer.relayerV6,
      wethIsEth: false,
    })

    // Get join call data
    const joinCallData = this.getReliquaryFbeetsJoinCallData({
      account,
      maxAmountsIn: call.maxAmountsIn.map(a => a.amount),
      minimumBpt: call.minBptOut.amount,
      outputReference: Relayer.toChainedReference(0n, false),
      fromInternalBalance: true,
    })

    // Get relic deposit data
    const relicDepositData = this.getRelicDepositOrCreateAndDeposit({
      userAddress: account,
      relicId,
      amount: Relayer.toChainedReference(0n, false),
    })

    // Return multicall data
    // TODO: create function to encode multicall
    return {
      account,
      chainId: this.helpers.chainId,
      data: encodeFunctionData({
        abi: balancerV2BalancerRelayerV6Abi,
        functionName: 'multicall',
        args: [[joinCallData, relicDepositData]],
      }),
      to: networkConfig.contracts.balancer.relayerV6,
    }
  }

  private getReliquaryFbeetsJoinCallData({
    account,
    maxAmountsIn,
    outputReference,
    fromInternalBalance,
    minimumBpt,
  }: {
    account: Address
    outputReference: bigint
    maxAmountsIn: bigint[]
    fromInternalBalance: boolean
    minimumBpt: bigint
  }) {
    return this.batchRelayerService.vaultEncodeJoinPool({
      poolId: PROJECT_CONFIG.corePoolId as Hex,
      poolKind: 0,
      sender: account,
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
          token: '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8', // TODO: add to config
          relicId: BigInt(relicId),
          amount,
          outputReference: 0n,
        })
      : this.batchRelayerService.reliquaryEncodeCreateRelicAndDeposit({
          sender: networkConfig.contracts.balancer.relayerV6,
          recipient: userAddress,
          token: '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8', // TODO: add to config
          poolId: 0n, // TODO: add to config?
          amount,
          outputReference: 0n,
        })
  }
}

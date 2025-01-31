import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { AddLiquidity, HumanAmount, Slippage } from '@balancer/sdk'
import { SdkBuildAddLiquidityInput } from '../add-liquidity.types'
import { BaseProportionalAddLiquidityHandler } from './BaseProportionalAddLiquidity.handler'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { Address, encodeFunctionData } from 'viem'
import networkConfig from '@repo/lib/config/networks/sonic'
import { Pool } from '../../../pool.types'
import { balancerV2BalancerRelayerV6Abi } from '@repo/lib/modules/web3/contracts/abi/generated'

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
    humanAmountsIn,
    slippagePercent,
    relicId,
  }: SdkBuildAddLiquidityInput & { relicId?: number }): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidity()

    console.log({ queryOutput })

    const { callData: joinCallData, value } = addLiquidity.buildCall({
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(slippagePercent as HumanAmount),
      sender: account,
      recipient: networkConfig.contracts.balancer.relayerV6,
      wethIsEth: this.helpers.isNativeAssetIn(humanAmountsIn),
    })

    // Get relic deposit data
    const relicDepositData = this.getRelicDepositOrCreateAndDeposit({
      userAddress: account,
      relicId,
      amount: this.batchRelayerService.toPersistentChainedReference(0),
    })

    console.log([joinCallData, relicDepositData])
    // Return multicall data
    return {
      account,
      chainId: this.helpers.chainId,
      data: encodeFunctionData({
        abi: balancerV2BalancerRelayerV6Abi,
        functionName: 'multicall',
        args: [[joinCallData, relicDepositData]],
      }),
      to: networkConfig.contracts.balancer.relayerV6,
      value,
    }
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

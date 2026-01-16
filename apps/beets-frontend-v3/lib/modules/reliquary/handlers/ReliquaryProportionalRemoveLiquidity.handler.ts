import { BeetsBatchRelayerService } from '@/lib/services/batch-relayer/beets-batch-relayer.service'
import { Relayer, RemoveLiquidity, Slippage } from '@balancer/sdk'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import networkConfig from '@repo/lib/config/networks/sonic'
import { BaseProportionalRemoveLiquidityHandler } from '@repo/lib/modules/pool/actions/remove-liquidity/handlers/BaseProportionalRemoveLiquidity.handler'
import { SdkBuildRemoveLiquidityInput } from '@repo/lib/modules/pool/actions/remove-liquidity/remove-liquidity.types'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { balancerV2BalancerRelayerV6Abi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { Address, encodeAbiParameters, encodeFunctionData, Hex } from 'viem'

export class ReliquaryProportionalRemoveLiquidityHandler extends BaseProportionalRemoveLiquidityHandler {
  constructor(
    pool: Pool,
    private readonly batchRelayerService: BeetsBatchRelayerService,
    private readonly relicId?: number
  ) {
    super(pool)
  }

  public async buildCallData({
    account,
    queryOutput,
    slippagePercent,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const relicId = this.relicId

    if (relicId === undefined || relicId === null) {
      throw new Error('relicId is required for reliquary remove liquidity')
    }

    const removeLiquidity = new RemoveLiquidity()

    // Simulate remove liquidity to get minAmountsOut
    const call = removeLiquidity.buildCall({
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      sender: account,
      recipient: account,
    })

    // Get withdraw from Relic call data
    const withdrawCallData = this.getRelicWithdrawAndHarvestCallData({
      account,
      relicId,
      bptAmount: queryOutput.sdkQueryOutput.bptIn.amount,
      outputReference: Relayer.toChainedReference(0n, false),
    })

    // Get exit pool call data
    const exitCallData = this.getReliquaryFbeetsExitCallData({
      account,
      minAmountsOut: call.minAmountsOut.map(a => a.amount),
      bptAmountIn: Relayer.toChainedReference(0n, false),
      outputReferences: [
        { index: 0n, key: Relayer.toChainedReference(1n, false) },
        { index: 1n, key: Relayer.toChainedReference(2n, false) },
      ],
    })

    // Return multicall data
    return {
      account,
      chainId: this.helpers.chainId,
      data: encodeFunctionData({
        abi: balancerV2BalancerRelayerV6Abi,
        functionName: 'multicall',
        args: [[withdrawCallData, exitCallData]],
      }),
      to: networkConfig.contracts.balancer.relayerV6,
    }
  }

  private getRelicWithdrawAndHarvestCallData({
    account,
    relicId,
    bptAmount,
    outputReference,
  }: {
    account: Address
    relicId: number
    bptAmount: bigint
    outputReference: bigint
  }) {
    return this.batchRelayerService.reliquaryEncodeWithdrawAndHarvest({
      recipient: account,
      relicId: BigInt(relicId),
      amount: bptAmount,
      outputReference,
    })
  }

  private getReliquaryFbeetsExitCallData({
    account,
    minAmountsOut,
    bptAmountIn,
    outputReferences,
  }: {
    account: Address
    minAmountsOut: bigint[]
    bptAmountIn: bigint
    outputReferences: { index: bigint; key: bigint }[]
  }) {
    return this.batchRelayerService.vaultEncodeExitPool({
      poolId: PROJECT_CONFIG.corePoolId as Hex,
      poolKind: 0,
      sender: account,
      recipient: account,
      exitPoolRequest: {
        assets: [
          networkConfig.tokens.addresses.beets || '0x',
          networkConfig.tokens.stakedAsset?.address || '0x',
        ],
        // Manually encode proportional exit: EXACT_BPT_IN_FOR_TOKENS_OUT (kind = 1)
        userData: encodeAbiParameters(
          [{ type: 'uint256' }, { type: 'uint256' }],
          [1n, bptAmountIn]
        ),
        minAmountsOut,
        toInternalBalance: false,
      },
      outputReferences,
    }) as Hex
  }
}

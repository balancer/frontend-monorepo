import { BeetsBatchRelayerService } from '@/lib/services/batch-relayer/beets-batch-relayer.service'
import { Relayer, RemoveLiquidity, Slippage } from '@balancer/sdk'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import networkConfig from '@repo/lib/config/networks/sonic'
import { BaseSingleTokenRemoveLiquidityHandler } from '@repo/lib/modules/pool/actions/remove-liquidity/handlers/BaseSingleTokenRemoveLiquidity.handler'
import { SdkBuildRemoveLiquidityInput } from '@repo/lib/modules/pool/actions/remove-liquidity/remove-liquidity.types'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { balancerV2BalancerRelayerV6Abi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { Address, encodeAbiParameters, encodeFunctionData, Hex } from 'viem'

export class ReliquarySingleTokenRemoveLiquidityHandler extends BaseSingleTokenRemoveLiquidityHandler {
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
    tokenOut,
  }: SdkBuildRemoveLiquidityInput & {
    tokenOut: Address
  }): Promise<TransactionConfig> {
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

    // Get exit pool call data for single token
    const exitCallData = this.getReliquaryFbeetsSingleTokenExitCallData({
      account,
      minAmountsOut: call.minAmountsOut.map(a => a.amount),
      bptAmountIn: Relayer.toChainedReference(0n, false),
      tokenOut,
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

  private getReliquaryFbeetsSingleTokenExitCallData({
    account,
    minAmountsOut,
    bptAmountIn,
    tokenOut,
    outputReferences,
  }: {
    account: Address
    minAmountsOut: bigint[]
    bptAmountIn: bigint
    tokenOut: Address
    outputReferences: { index: bigint; key: bigint }[]
  }) {
    const assets = [
      networkConfig.tokens.addresses.beets || '0x',
      networkConfig.tokens.stakedAsset?.address || '0x',
    ]

    // Find the index of the tokenOut in the assets array
    const exitTokenIndex = assets.findIndex(asset => asset.toLowerCase() === tokenOut.toLowerCase())

    if (exitTokenIndex === -1) {
      throw new Error(`Token ${tokenOut} not found in pool assets`)
    }

    // Manually encode single token exit: EXACT_BPT_IN_FOR_ONE_TOKEN_OUT (kind = 0)
    // userData format: [kind, bptAmountIn, exitTokenIndex]
    const userData = encodeAbiParameters(
      [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
      [0n, bptAmountIn, BigInt(exitTokenIndex)]
    )

    return this.batchRelayerService.vaultEncodeExitPool({
      poolId: PROJECT_CONFIG.corePoolId as Hex,
      poolKind: 0,
      sender: account,
      recipient: account,
      exitPoolRequest: {
        assets,
        userData,
        minAmountsOut,
        toInternalBalance: false,
      },
      outputReferences,
    }) as Hex
  }
}

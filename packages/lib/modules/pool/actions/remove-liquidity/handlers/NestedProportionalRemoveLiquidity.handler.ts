import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import {
  HumanAmount,
  RemoveLiquidityNested,
  RemoveLiquidityNestedCallInputV2,
  RemoveLiquidityNestedProportionalInputV2,
  RemoveLiquidityNestedQueryOutput,
  Slippage,
} from '@balancer/sdk'
import { parseEther } from 'viem'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import {
  BuildRemoveLiquidityInput,
  QueryRemoveLiquidityInput,
  QueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { RemoveLiquidityHandler } from './RemoveLiquidity.handler'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'

export interface NestedProportionalQueryRemoveLiquidityOutput extends QueryRemoveLiquidityOutput {
  sdkQueryOutput: RemoveLiquidityNestedQueryOutput
}

export interface NestedProportionalQueryRemoveLiquidityInput extends BuildRemoveLiquidityInput {
  queryOutput: NestedProportionalQueryRemoveLiquidityOutput
}

export class NestedProportionalRemoveLiquidityHandler implements RemoveLiquidityHandler {
  helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async simulate({
    humanBptIn,
  }: QueryRemoveLiquidityInput): Promise<NestedProportionalQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidityNested()

    const removeLiquidityInput = this.constructSdkInput(humanBptIn)

    const sdkQueryOutput = await removeLiquidity.query(
      removeLiquidityInput,
      this.helpers.nestedPoolState
    )

    return { amountsOut: sdkQueryOutput.amountsOut, sdkQueryOutput }
  }

  public async getPriceImpact(): Promise<number> {
    // proportional remove liquidity does not have price impact
    return 0
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    wethIsEth,
    relayerApprovalSignature,
  }: NestedProportionalQueryRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidityNested()

    const { callData, to } = removeLiquidity.buildCall({
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      accountAddress: account,
      relayerApprovalSignature,
      wethIsEth,
    } as RemoveLiquidityNestedCallInputV2)

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
    }
  }

  /**
   * PRIVATE METHODS
   */
  private constructSdkInput(humanBptIn: HumanAmount): RemoveLiquidityNestedProportionalInputV2 {
    const result: RemoveLiquidityNestedProportionalInputV2 = {
      bptAmountIn: parseEther(humanBptIn),
      // Ignore TS error until base chain is added to the SDK setup:
      // https://github.com/balancer/b-sdk/issues/221
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
    }

    return result
  }
}

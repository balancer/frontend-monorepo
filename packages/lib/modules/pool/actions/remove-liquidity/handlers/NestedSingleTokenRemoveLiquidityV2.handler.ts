import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import {
  HumanAmount,
  RemoveLiquidityNested,
  RemoveLiquidityNestedSingleTokenInputV2,
  RemoveLiquidityNestedQueryOutput,
  Slippage,
  PriceImpactAmount,
  PriceImpact,
  RemoveLiquidityNestedCallInputV2,
} from '@balancer/sdk'
import { Address, parseEther } from 'viem'
import { Pool } from '../../../pool.types'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import {
  BuildRemoveLiquidityInput,
  QueryRemoveLiquidityInput,
  QueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { RemoveLiquidityHandler } from './RemoveLiquidity.handler'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'

export interface NestedSingleTokenQueryRemoveLiquidityOutput extends QueryRemoveLiquidityOutput {
  sdkQueryOutput: RemoveLiquidityNestedQueryOutput
}

export interface NestedSingleTokenQueryRemoveLiquidityInput extends BuildRemoveLiquidityInput {
  queryOutput: NestedSingleTokenQueryRemoveLiquidityOutput
}

export class NestedSingleTokenRemoveLiquidityV2Handler implements RemoveLiquidityHandler {
  helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async getPriceImpact({
    humanBptIn,
    tokenOut,
  }: QueryRemoveLiquidityInput): Promise<number> {
    const removeLiquidityInput: RemoveLiquidityNestedSingleTokenInputV2 = this.constructSdkInput(
      humanBptIn,
      tokenOut
    )

    const priceImpactABA: PriceImpactAmount = await PriceImpact.removeLiquidityNested(
      removeLiquidityInput,
      this.helpers.nestedPoolStateV2
    )

    return priceImpactABA.decimal
  }

  public async simulate({
    humanBptIn,
    tokenOut,
  }: QueryRemoveLiquidityInput): Promise<NestedSingleTokenQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidityNested()

    const removeLiquidityInput: RemoveLiquidityNestedSingleTokenInputV2 = this.constructSdkInput(
      humanBptIn,
      tokenOut
    )

    const sdkQueryOutput = await removeLiquidity.query(
      removeLiquidityInput,
      this.helpers.nestedPoolStateV2
    )

    return { amountsOut: sdkQueryOutput.amountsOut, sdkQueryOutput }
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    relayerApprovalSignature,
    wethIsEth,
  }: NestedSingleTokenQueryRemoveLiquidityInput): Promise<TransactionConfig> {
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
  private constructSdkInput(
    humanBptIn: HumanAmount,
    tokenOut: Address
  ): RemoveLiquidityNestedSingleTokenInputV2 {
    const result: RemoveLiquidityNestedSingleTokenInputV2 = {
      bptAmountIn: parseEther(humanBptIn),
      tokenOut,
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
    }

    return result
  }
}

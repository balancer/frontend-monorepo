import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import {
  HumanAmount,
  RemoveLiquidityNested,
  RemoveLiquidityNestedSingleTokenInput,
  RemoveLiquidityNestedQueryOutput,
  Slippage,
  PriceImpactAmount,
  PriceImpact,
} from '@balancer/sdk'
import { Address, parseEther } from 'viem'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import {
  BuildRemoveLiquidityInput,
  QueryRemoveLiquidityInput,
  QueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { RemoveLiquidityHandler } from './RemoveLiquidity.handler'
import { getRpcUrl } from '@/lib/modules/web3/transports'

export interface NestedSingleTokenQueryRemoveLiquidityOutput extends QueryRemoveLiquidityOutput {
  sdkQueryOutput: RemoveLiquidityNestedQueryOutput
}

export interface NestedSingleTokenQueryRemoveLiquidityInput extends BuildRemoveLiquidityInput {
  queryOutput: NestedSingleTokenQueryRemoveLiquidityOutput
}

export class NestedSingleTokenRemoveLiquidityHandler implements RemoveLiquidityHandler {
  helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async simulate({
    humanBptIn,
    tokenOut,
  }: QueryRemoveLiquidityInput): Promise<NestedSingleTokenQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidityNested()

    const removeLiquidityInput = this.constructSdkInput(humanBptIn, tokenOut)

    const sdkQueryOutput = await removeLiquidity.query(
      removeLiquidityInput,
      this.helpers.nestedPoolState
    )

    return { amountsOut: sdkQueryOutput.amountsOut, sdkQueryOutput }
  }

  public async getPriceImpact({
    humanBptIn,
    tokenOut,
  }: QueryRemoveLiquidityInput): Promise<number> {
    const removeLiquidityInput = this.constructSdkInput(humanBptIn, tokenOut)

    const priceImpactABA: PriceImpactAmount = await PriceImpact.removeLiquidityNested(
      removeLiquidityInput,
      this.helpers.nestedPoolState
    )

    return priceImpactABA.decimal
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
    })

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
  ): RemoveLiquidityNestedSingleTokenInput {
    const result: RemoveLiquidityNestedSingleTokenInput = {
      bptAmountIn: parseEther(humanBptIn),
      tokenOut,
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

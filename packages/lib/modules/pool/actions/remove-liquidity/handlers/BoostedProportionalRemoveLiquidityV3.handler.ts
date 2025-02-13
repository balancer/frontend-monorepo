import {
  RemoveLiquidityBoostedBuildCallInput,
  RemoveLiquidityBoostedV3,
  RemoveLiquidityKind,
  Slippage,
} from '@balancer/sdk'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import {
  QueryRemoveLiquidityInput,
  SdkBuildRemoveLiquidityInput,
  SdkQueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { BaseProportionalRemoveLiquidityHandler } from './BaseProportionalRemoveLiquidity.handler'

export class BoostedProportionalRemoveLiquidityV3Handler extends BaseProportionalRemoveLiquidityHandler {
  public async simulate({
    humanBptIn: bptIn,
    userAddress,
    tokensOut,
  }: QueryRemoveLiquidityInput): Promise<SdkQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidityBoostedV3()
    if (!tokensOut) throw new Error('tokensOut is required for boosted remove liquidity')
    const removeLiquidityInput = { ...this.constructSdkInput(bptIn, userAddress), tokensOut }

    const sdkQueryOutput = await removeLiquidity.query(
      removeLiquidityInput,
      this.helpers.boostedPoolState
    )

    return {
      amountsOut: sdkQueryOutput.amountsOut.filter(a => a.amount > 0n),
      sdkQueryOutput,
      unwrapWrapped: sdkQueryOutput.unwrapWrapped,
    }
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    permit,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidityBoostedV3()

    if (!queryOutput.unwrapWrapped) {
      throw new Error('unwrapWrapped is required for boosted remove liquidity')
    }

    const v3BuildCallParams: RemoveLiquidityBoostedBuildCallInput = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      protocolVersion: 3,
      userData: '0x',
      removeLiquidityKind: RemoveLiquidityKind.Proportional,
      unwrapWrapped: queryOutput.unwrapWrapped,
    }

    const { callData, to, value } = permit
      ? removeLiquidity.buildCallWithPermit(v3BuildCallParams, permit)
      : removeLiquidity.buildCall(v3BuildCallParams)

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
      value,
    }
  }
}

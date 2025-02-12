import {
  Address,
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
    // tokensOut,
  }: QueryRemoveLiquidityInput): Promise<SdkQueryRemoveLiquidityOutput> {
    // DEBUG: in sepolia pool
    // const tokensOut = [
    //   '0x7b79995e5f793a07bc00c21412e50ecae098e7f9' as Address, // WETH
    //   '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' as Address, // usdt Aave
    // ]
    const tokensOut: Address[] = []
    const removeLiquidity = new RemoveLiquidityBoostedV3()
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
    unwrapWrapped,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidityBoostedV3()

    if (!unwrapWrapped) {
      throw new Error('unwrapWrapped is required for boosted remove liquidity')
    }

    const v3BuildCallParams: RemoveLiquidityBoostedBuildCallInput = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      protocolVersion: 3,
      userData: '0x',
      removeLiquidityKind: RemoveLiquidityKind.Proportional,
      unwrapWrapped,
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

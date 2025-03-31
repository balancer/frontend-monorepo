import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { RemoveLiquidity, RemoveLiquidityV3BuildCallInput, Slippage } from '@balancer/sdk'
import { SdkBuildRemoveLiquidityInput } from '../remove-liquidity.types'
import { BaseProportionalRemoveLiquidityHandler } from './BaseProportionalRemoveLiquidity.handler'

export class ProportionalRemoveLiquidityV3Handler extends BaseProportionalRemoveLiquidityHandler {
  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    wethIsEth,
    permit,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidity()

    const v3BuildCallParams: RemoveLiquidityV3BuildCallInput = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      wethIsEth,
      userData: '0x',
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

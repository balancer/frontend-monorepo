import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import { RemoveLiquidity, Slippage } from '@balancer/sdk'
import { SdkBuildRemoveLiquidityInput } from '../remove-liquidity.types'
import { BaseSingleTokenRemoveLiquidityHandler } from './BaseSingleTokenRemoveLiquidity.handler'

export class SingleTokenRemoveLiquidityV3Handler extends BaseSingleTokenRemoveLiquidityHandler {
  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    wethIsEth,
    permit,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidity()

    const v3BuildCallParams = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      wethIsEth,
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

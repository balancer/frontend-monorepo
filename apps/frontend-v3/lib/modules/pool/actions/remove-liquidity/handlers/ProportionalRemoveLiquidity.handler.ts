import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import { RemoveLiquidity, Slippage } from '@balancer/sdk'
import { formatBuildCallParams } from '../../LiquidityActionHelpers'
import { SdkBuildRemoveLiquidityInput } from '../remove-liquidity.types'
import { BaseProportionalRemoveLiquidityHandler } from './BaseProportionalRemoveLiquidity.handler'

// Used by V2 and CowAMM (V1) pools
export class ProportionalRemoveLiquidityHandler extends BaseProportionalRemoveLiquidityHandler {
  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    wethIsEth,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidity()

    const baseBuildCallParams = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      wethIsEth,
    }

    const buildCallParams = formatBuildCallParams(baseBuildCallParams, account)

    const { callData, to, value } = removeLiquidity.buildCall(buildCallParams)

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
      value,
    }
  }
}

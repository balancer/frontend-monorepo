import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import { RemoveLiquidity, Slippage } from '@balancer/sdk'
import { formatBuildCallParams } from '../../LiquidityActionHelpers'
import { SdkBuildRemoveLiquidityInput } from '../remove-liquidity.types'
import { BaseSingleTokenRemoveLiquidityHandler } from './BaseSingleTokenRemoveLiquidity.handler'

export class SingleTokenRemoveLiquidityV2Handler extends BaseSingleTokenRemoveLiquidityHandler {
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

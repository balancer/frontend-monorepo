import { AddLiquidityBoostedBuildCallInput, AddLiquidityBoostedV3, Hex } from '@balancer/sdk'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { SdkBuildAddLiquidityInput } from '../add-liquidity.types'
import { BaseProportionalAddLiquidityHandler } from './BaseProportionalAddLiquidity.handler'
import { constructBaseBuildCallInput } from './add-liquidity.utils'

export class ProportionalBoostedUnbalancedAddLiquidityV3Handler extends BaseProportionalAddLiquidityHandler {
  public async buildCallData({
    humanAmountsIn,
    slippagePercent,
    queryOutput,
    account,
    permit2,
  }: SdkBuildAddLiquidityInput): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidityBoostedV3()

    const buildCallParams: AddLiquidityBoostedBuildCallInput = {
      ...constructBaseBuildCallInput({
        humanAmountsIn,
        sdkQueryOutput: queryOutput.sdkQueryOutput,
        slippagePercent: slippagePercent,
        pool: this.helpers.pool,
      }),
      protocolVersion: 3,
      userData: '0x' as Hex,
    }

    const { callData, to, value } = permit2
      ? addLiquidity.buildCallWithPermit2(buildCallParams, permit2)
      : addLiquidity.buildCall(buildCallParams)

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
      value,
    }
  }
}

import {
  AddLiquidityBoostedBuildCallInput,
  AddLiquidityBoostedInput,
  AddLiquidityBoostedV3,
  Hex,
} from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { SdkBuildAddLiquidityInput, SdkQueryAddLiquidityOutput } from '../add-liquidity.types'
import { BaseUnbalancedAddLiquidityHandler } from './BaseUnbalancedAddLiquidity.handler'
import { constructBaseBuildCallInput } from './add-liquidity.utils'

export class BoostedUnbalancedAddLiquidityV3Handler extends BaseUnbalancedAddLiquidityHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getPriceImpact(humanAmountsIn?: HumanTokenAmountWithAddress[]): Promise<number> {
    // TODO: Return 0 until SDK implements Price Impact for boosted pools
    return 0
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithAddress[]
  ): Promise<SdkQueryAddLiquidityOutput> {
    const addLiquidity = new AddLiquidityBoostedV3()
    const addLiquidityInput: AddLiquidityBoostedInput = this.constructSdkInput(humanAmountsIn)

    const sdkQueryOutput = await addLiquidity.query(
      addLiquidityInput,
      this.helpers.boostedPoolState
    )

    return { bptOut: sdkQueryOutput.bptOut, sdkQueryOutput }
  }

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

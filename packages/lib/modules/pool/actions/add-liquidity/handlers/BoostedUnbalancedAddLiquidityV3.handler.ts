import {
  AddLiquidityBoostedBuildCallInput,
  AddLiquidityBoostedInput,
  AddLiquidityBoostedV3,
  Hex,
  PriceImpact,
  PriceImpactAmount,
} from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { SdkBuildAddLiquidityInput, SdkQueryAddLiquidityOutput } from '../add-liquidity.types'
import { BaseUnbalancedAddLiquidityHandler } from './BaseUnbalancedAddLiquidity.handler'
import { constructBaseBuildCallInput } from './add-liquidity.utils'
import { areEmptyAmounts } from '../../LiquidityActionHelpers'

export class BoostedUnbalancedAddLiquidityV3Handler extends BaseUnbalancedAddLiquidityHandler {
  public async getPriceImpact(humanAmountsIn: HumanTokenAmountWithAddress[]): Promise<number> {
    if (areEmptyAmounts(humanAmountsIn)) {
      // Avoid price impact calculation when there are no amounts in
      return 0
    }

    const addLiquidityInput = this.constructSdkInput(humanAmountsIn)

    const priceImpactABA: PriceImpactAmount = await PriceImpact.addLiquidityUnbalancedBoosted(
      addLiquidityInput,
      this.helpers.boostedPoolState
    )

    return priceImpactABA.decimal
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

    return { bptOut: sdkQueryOutput.bptOut, to: sdkQueryOutput.to, sdkQueryOutput }
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
      wethIsEth: this.helpers.isNativeAssetIn(humanAmountsIn),
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

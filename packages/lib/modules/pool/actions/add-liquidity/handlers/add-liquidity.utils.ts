//TODO: move all this file logic to a better place

import {
  AddLiquidityBaseBuildCallInput,
  AddLiquidityBaseQueryOutput,
  AddLiquidityKind,
  AddLiquidityProportionalInput,
  Address,
  InputAmount,
  RemoveLiquidityBaseBuildCallInput,
  RemoveLiquidityQueryOutput,
  Slippage,
} from '@balancer/sdk'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'

// For now only valid for unbalanced and proportional adds
export function constructBaseBuildCallInput({
  humanAmountsIn,
  slippagePercent,
  sdkQueryOutput,
  pool,
}: {
  humanAmountsIn: HumanTokenAmountWithAddress[]
  slippagePercent: string
  sdkQueryOutput: AddLiquidityBaseQueryOutput
  pool: Pool
}): AddLiquidityBaseBuildCallInput {
  const helpers = new LiquidityActionHelpers(pool)

  const baseBuildCallParams = {
    ...(sdkQueryOutput as AddLiquidityBaseQueryOutput),
    slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
    wethIsEth: helpers.isNativeAssetIn(humanAmountsIn),
  }
  // baseBuildCallParams.amountsIn = baseBuildCallParams.amountsIn.filter(
  //   amountIn => amountIn.amount > 0n
  // )
  return baseBuildCallParams
}

export function constructProportionalSdkAddInput(
  chainId: number,
  referenceAmount: InputAmount,
  userAddress: Address
): AddLiquidityProportionalInput {
  return {
    chainId,
    rpcUrl: getRpcUrl(chainId),
    referenceAmount,
    kind: AddLiquidityKind.Proportional,
    sender: userAddress,
  }
}

// For now only valid for unbalanced removes
export function constructRemoveBaseBuildCallInput({
  slippagePercent,
  sdkQueryOutput,
  wethIsEth,
}: {
  slippagePercent: string
  sdkQueryOutput: RemoveLiquidityQueryOutput
  wethIsEth: boolean
}): RemoveLiquidityBaseBuildCallInput {
  const baseBuildCallParams = {
    ...sdkQueryOutput,
    slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
    wethIsEth,
  }
  return baseBuildCallParams
}

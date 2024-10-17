import { Address } from 'viem'
import { HumanAmount } from '@balancer/sdk'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'

const removeLiquidity = 'remove-liquidity'

function getHandlerClassName(instance: RemoveLiquidityHandler): string {
  return instance.constructor.name
}

export type RemoveLiquidityParams = {
  handler: RemoveLiquidityHandler
  userAddress: string
  poolId: string
  slippage: string
  humanBptIn: HumanAmount
  tokenOut?: Address // only used by single token removal type
  wethIsEth?: boolean // only used by single token removal type
}
function liquidityParams({
  handler,
  userAddress,
  poolId,
  slippage,
  humanBptIn,
  tokenOut,
  wethIsEth,
}: RemoveLiquidityParams) {
  return `${getHandlerClassName(
    handler
  )}:${userAddress}:${poolId}:${slippage}:${humanBptIn}:${tokenOut}:${wethIsEth}`
}
export const removeLiquidityKeys = {
  priceImpact: (params: RemoveLiquidityParams) =>
    [removeLiquidity, 'price-impact', liquidityParams(params)] as const,
  preview: (params: RemoveLiquidityParams) =>
    [removeLiquidity, 'preview', liquidityParams(params)] as const,
  buildCallData: (params: RemoveLiquidityParams) =>
    [removeLiquidity, 'buildCallData', liquidityParams(params)] as const,
}

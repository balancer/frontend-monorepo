import { GqlPoolType } from '@/lib/shared/services/api/generated/graphql'
import { requiresProportionalInput } from '../../LiquidityActionHelpers'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

const addLiquidity = 'add-liquidity'

function getHandlerClassName(instance: AddLiquidityHandler): string {
  return instance.constructor.name
}

export type AddLiquidityParams = {
  handler: AddLiquidityHandler
  userAddress: string
  poolId: string
  poolType: GqlPoolType
  slippage: string
  humanAmountsIn: HumanTokenAmountWithAddress[]
}

function liquidityParams({
  handler,
  userAddress,
  poolId,
  poolType,
  slippage,
  humanAmountsIn,
}: AddLiquidityParams) {
  return `${getHandlerClassName(
    handler
  )}:${userAddress}:${poolId}:${slippage}:${stringifyHumanAmountsIn(poolType, humanAmountsIn)}`
}

export function stringifyHumanAmountsIn(
  poolType: GqlPoolType,
  humanAmountsIn: HumanTokenAmountWithAddress[]
): string {
  if (humanAmountsIn.length === 0) return ''
  if (requiresProportionalInput(poolType)) {
    /*
    This is an edge-case where we only use the first human amount in the array to avoid triggering queries when the other human amounts change automatically
    (as they are automatically calculated and entered in the proportional add liquidity flow).
    */
    return JSON.stringify(humanAmountsIn[0])
  }

  return JSON.stringify(humanAmountsIn)
}

export const addLiquidityKeys = {
  priceImpact: (params: AddLiquidityParams) =>
    [addLiquidity, 'price-impact', liquidityParams(params)] as const,
  preview: (params: AddLiquidityParams) =>
    [addLiquidity, 'preview', liquidityParams(params)] as const,
  buildCallData: (params: AddLiquidityParams) =>
    [addLiquidity, 'buildCallData', liquidityParams(params)] as const,
}

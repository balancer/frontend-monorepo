import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { Pool } from '../../../PoolProvider'
import { requiresProportionalInput } from '../../LiquidityActionHelpers'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'

const addLiquidity = 'add-liquidity'

function getHandlerClassName(instance: AddLiquidityHandler): string {
  return instance.constructor.name
}

export type AddLiquidityParams = {
  handler: AddLiquidityHandler
  userAddress: string
  pool: Pool
  slippage: string
  humanAmountsIn: HumanTokenAmountWithAddress[]
  hasPermit2?: boolean
}

function liquidityParams({
  handler,
  userAddress,
  pool,
  slippage,
  humanAmountsIn,
  hasPermit2,
}: AddLiquidityParams) {
  return `${getHandlerClassName(handler)}:${userAddress}:${
    pool.id
  }:${slippage}:${stringifyHumanAmountsIn(pool, humanAmountsIn)}${
    hasPermit2 ? 'permit2' : 'no-permit2'
  }`
}

export function stringifyHumanAmountsIn(
  pool: Pool,
  humanAmountsIn: HumanTokenAmountWithAddress[]
): string {
  if (humanAmountsIn.length === 0) return ''
  if (requiresProportionalInput(pool)) {
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

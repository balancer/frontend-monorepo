import { getChainId } from '@repo/lib/config/app.config'
import { Pool } from '../../../PoolProvider'
import { TwammAddLiquidityHandler } from './TwammAddLiquidity.handler'
import { UnbalancedAddLiquidityV2Handler } from './UnbalancedAddLiquidityV2.handler'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { NestedAddLiquidityV2Handler } from './NestedAddLiquidityV2.handler'
import { requiresProportionalInput, supportsNestedActions } from '../../LiquidityActionHelpers'
import { ProportionalAddLiquidityHandler } from './ProportionalAddLiquidity.handler'
import { isBoosted, isV3Pool } from '../../../pool.helpers'
import { ProportionalAddLiquidityHandlerV3 } from './ProportionalAddLiquidityV3.handler'
import { UnbalancedAddLiquidityV3Handler } from './UnbalancedAddLiquidityV3.handler'
import { BoostedUnbalancedAddLiquidityV3Handler } from './BoostedUnbalancedAddLiquidityV3.handler'
import { NestedAddLiquidityV3Handler } from './NestedAddLiquidityV3.handler'

export function selectAddLiquidityHandler(pool: Pool): AddLiquidityHandler {
  // This is just an example to illustrate how edge-case handlers would receive different inputs but return a common contract
  if (pool.id === 'TWAMM-example') return new TwammAddLiquidityHandler(getChainId(pool.chain))

  // TODO add && not toggled escape hatch to high level tokens
  // We should add a toggle to the form which allows the user to revert to
  // adding liquidity in the first level pool tokens.
  if (supportsNestedActions(pool)) {
    return isV3Pool(pool)
      ? new NestedAddLiquidityV3Handler(pool)
      : new NestedAddLiquidityV2Handler(pool)
  }

  if (isBoosted(pool)) return new BoostedUnbalancedAddLiquidityV3Handler(pool)

  if (requiresProportionalInput(pool)) {
    if (isV3Pool(pool)) {
      return new ProportionalAddLiquidityHandlerV3(pool)
    }
    return new ProportionalAddLiquidityHandler(pool)
  }

  if (isV3Pool(pool)) return new UnbalancedAddLiquidityV3Handler(pool)

  return new UnbalancedAddLiquidityV2Handler(pool)
}

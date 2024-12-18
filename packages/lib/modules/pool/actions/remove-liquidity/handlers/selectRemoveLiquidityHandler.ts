import { Pool } from '../../../PoolProvider'
import { isBoosted, isV3Pool } from '../../../pool.helpers'
import {
  shouldUseRecoveryRemoveLiquidity,
  supportsNestedActions,
} from '../../LiquidityActionHelpers'
import { RemoveLiquidityType } from '../remove-liquidity.types'
import { BoostedProportionalRemoveLiquidityV3Handler } from './BoostedProportionalRemoveLiquidityV3.handler'
import { NestedProportionalRemoveLiquidityHandler } from './NestedProportionalRemoveLiquidity.handler'
import { NestedProportionalRemoveLiquidityV3Handler } from './NestedProportionalRemoveLiquidityV3.handler'
import { NestedSingleTokenRemoveLiquidityV2Handler } from './NestedSingleTokenRemoveLiquidityV2.handler'
import { ProportionalRemoveLiquidityHandler } from './ProportionalRemoveLiquidity.handler'
import { ProportionalRemoveLiquidityV3Handler } from './ProportionalRemoveLiquidityV3.handler'
import { RecoveryRemoveLiquidityHandler } from './RecoveryRemoveLiquidity.handler'
import { RemoveLiquidityHandler } from './RemoveLiquidity.handler'
import { SingleTokenRemoveLiquidityV2Handler } from './SingleTokenRemoveLiquidityV2.handler'
import { SingleTokenRemoveLiquidityV3Handler } from './SingleTokenRemoveLiquidityV3.handler'

export function selectRemoveLiquidityHandler(
  pool: Pool,
  kind: RemoveLiquidityType
): RemoveLiquidityHandler {
  // TODO: Depending on the pool attributes we will return a different handler
  // if (pool.id === 'TWAMM-example') {
  //   // This is just an example to illustrate how edge-case handlers would receive different inputs but return a common contract
  //   return new TwammRemoveLiquidityHandler(getChainId(pool.chain))
  // }

  if (shouldUseRecoveryRemoveLiquidity(pool)) {
    console.log('Recovery handler')
    return new RecoveryRemoveLiquidityHandler(pool)
  }

  if (supportsNestedActions(pool) && kind === RemoveLiquidityType.Proportional) {
    return isV3Pool(pool)
      ? new NestedProportionalRemoveLiquidityV3Handler(pool)
      : new NestedProportionalRemoveLiquidityHandler(pool)
  }

  if (supportsNestedActions(pool) && kind === RemoveLiquidityType.SingleToken) {
    return new NestedSingleTokenRemoveLiquidityV2Handler(pool)
  }

  if (isV3Pool(pool) && isBoosted(pool)) {
    return new BoostedProportionalRemoveLiquidityV3Handler(pool)
  }

  if (kind === RemoveLiquidityType.SingleToken) {
    if (isV3Pool(pool)) return new SingleTokenRemoveLiquidityV3Handler(pool)
    // V2 pools
    return new SingleTokenRemoveLiquidityV2Handler(pool)
  }

  if (isV3Pool(pool)) {
    return new ProportionalRemoveLiquidityV3Handler(pool)
  }

  // Default type
  return new ProportionalRemoveLiquidityHandler(pool)
}

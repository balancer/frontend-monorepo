 
import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { Pool } from '../../../pool.types'
import { TwammAddLiquidityHandler } from './TwammAddLiquidity.handler'
import { UnbalancedAddLiquidityV2Handler } from './UnbalancedAddLiquidityV2.handler'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { NestedAddLiquidityV2Handler } from './NestedAddLiquidityV2.handler'
import { supportsNestedActions } from '../../LiquidityActionHelpers'
import { ProportionalAddLiquidityHandler } from './ProportionalAddLiquidity.handler'
import { isBoosted, isMaBeetsPool, isV3Pool } from '../../../pool.helpers'
import { ProportionalAddLiquidityHandlerV3 } from './ProportionalAddLiquidityV3.handler'
import { UnbalancedAddLiquidityV3Handler } from './UnbalancedAddLiquidityV3.handler'
import { BoostedUnbalancedAddLiquidityV3Handler } from './BoostedUnbalancedAddLiquidityV3.handler'
import { NestedAddLiquidityV3Handler } from './NestedAddLiquidityV3.handler'
import { ProportionalBoostedAddLiquidityV3 } from './ProportionalBoostedAddLiquidityV3.handler'
import { ReliquaryProportionalAddLiquidityHandler } from './ReliquaryProportionalAddLiquidity.handler'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'

export function selectAddLiquidityHandler(
  pool: Pool,
  wantsProportional = false
): AddLiquidityHandler {
  // This is just an example to illustrate how edge-case handlers would receive different inputs but return a common contract
  if (pool.id === 'TWAMM-example') return new TwammAddLiquidityHandler(getChainId(pool.chain))

  // TODO add && not toggled escape hatch to high level tokens
  // We should add a toggle to the form which allows the user to revert to
  // adding liquidity in the first level pool tokens.
  if (supportsNestedActions(pool)) {
    // TODO: console.log(
    //   'NestedAddLiquidityV3Handler should work with unbalanced + calculate proportional',
    //   { wantsProportional }
    // )
    return isV3Pool(pool)
      ? new NestedAddLiquidityV3Handler(pool)
      : new NestedAddLiquidityV2Handler(pool)
  }

  if (isBoosted(pool)) {
    if (wantsProportional) {
      return new ProportionalBoostedAddLiquidityV3(pool)
    }
    return new BoostedUnbalancedAddLiquidityV3Handler(pool)
  }

  if (wantsProportional) {
    if (isV3Pool(pool)) {
      return new ProportionalAddLiquidityHandlerV3(pool)
    }
    if (isMaBeetsPool(pool.id)) {
      const networkConfig = getNetworkConfig(pool.chain)
      const batchRelayerService = BatchRelayerService.create(
        networkConfig.contracts.balancer.relayerV6,
        true // include reliquary service
      )

      return new ReliquaryProportionalAddLiquidityHandler(pool, batchRelayerService)
    }
    return new ProportionalAddLiquidityHandler(pool)
  }

  if (isV3Pool(pool)) return new UnbalancedAddLiquidityV3Handler(pool)

  return new UnbalancedAddLiquidityV2Handler(pool)
}

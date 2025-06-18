import { getPoolActionableTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { SwapForm } from '@repo/lib/modules/swap/SwapForm'
import SwapLayout from '@repo/lib/modules/swap/SwapLayout'
import { SwapProviderProps, PathParams } from '@repo/lib/modules/swap/SwapProvider'
import { isBefore, secondsToMilliseconds, format } from 'date-fns'
import { now } from '@repo/lib/shared/utils/time'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'

export function LbpSwap() {
  const { pool } = usePool()

  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const poolActionableTokens = getPoolActionableTokens(lbpPool)

  const pathParams: PathParams = {
    chain: chainToSlugMap[pool.chain],
    tokenIn: poolActionableTokens[0].address,
    tokenOut: poolActionableTokens[1].address,
  }

  const props: SwapProviderProps = {
    pathParams,
    pool,
    poolActionableTokens: poolActionableTokens,
  }

  return (
    <SwapLayout props={props}>
      <SwapForm
        hasDisabledInputs={isBefore(now(), secondsToMilliseconds(lbpPool.startTime))}
        nextButtonText={`Sale starts ${format(secondsToMilliseconds(lbpPool.startTime), 'haaa, MM/dd/yy')}`}
      />
    </SwapLayout>
  )
}

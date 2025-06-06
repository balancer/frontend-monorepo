import { getPoolActionableTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { SwapForm } from '@repo/lib/modules/swap/SwapForm'
import SwapLayout from '@repo/lib/modules/swap/SwapLayout'
import { SwapProviderProps, PathParams } from '@repo/lib/modules/swap/SwapProvider'

export function LbpSwap() {
  const { pool } = usePool()

  const poolActionableTokens = getPoolActionableTokens(pool)

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
      <SwapForm />
    </SwapLayout>
  )
}

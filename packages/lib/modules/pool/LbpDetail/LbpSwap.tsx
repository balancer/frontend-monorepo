import { getPoolActionableTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { SwapForm } from '@repo/lib/modules/swap/SwapForm'
import SwapLayout from '@repo/lib/modules/swap/SwapLayout'
import { SwapProviderProps, PathParams } from '@repo/lib/modules/swap/SwapProvider'
import { isBefore, secondsToMilliseconds, format } from 'date-fns'
import { now } from '@repo/lib/shared/utils/time'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

export function LbpSwap() {
  const { pool } = usePool()
  const { priceFor } = useTokens()

  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const poolActionableTokens = getPoolActionableTokens(lbpPool)

  const launchToken = lbpPool.poolTokens[lbpPool.projectTokenIndex] as ApiToken

  // keep pathParams here to pass chain
  const pathParams: PathParams = {
    chain: chainToSlugMap[pool.chain],
    tokenIn: lbpPool.reserveToken,
    tokenOut: lbpPool.projectToken,
  }

  const props: SwapProviderProps = {
    pathParams,
    pool,
    poolActionableTokens,
  }

  const isBeforeSaleStart = isBefore(now(), secondsToMilliseconds(lbpPool.startTime))

  return (
    <SwapLayout props={props}>
      <SwapForm
        customToken={launchToken}
        customTokenUsdPrice={priceFor(lbpPool.projectToken, pool.chain)}
        hasDisabledInputs={isBeforeSaleStart}
        nextButtonText={
          isBeforeSaleStart
            ? `Sale starts ${format(secondsToMilliseconds(lbpPool.startTime), 'haaa, MM/dd/yy')}`
            : 'Next'
        }
      />
    </SwapLayout>
  )
}

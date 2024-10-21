'use client'

import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { getPoolTokens } from '@repo/lib/modules/pool/pool.helpers'
import { usePoolRedirect } from '@repo/lib/modules/pool/pool.hooks'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { SwapForm } from '@repo/lib/modules/swap/SwapForm'
import SwapLayout from '@repo/lib/modules/swap/SwapLayout'
import { PathParams, SwapProviderProps } from '@repo/lib/modules/swap/SwapProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { Hash } from 'viem'

type Props = {
  params: { txHash?: string[] }
}
// Page for swapping from a pool page
export default function PoolSwapPage({ params: { txHash } }: Props) {
  const { getToken } = useTokens()
  const { pool, isLoading } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const poolTokens = getPoolTokens(pool, getToken)

  const maybeTxHash = (txHash?.[0] as Hash) || undefined

  const pathParams: PathParams = {
    chain: chainToSlugMap[pool.chain],
    tokenIn: poolTokens[0].address,
    tokenOut: poolTokens[1].address,
    urlTxHash: maybeTxHash,
  }
  const props: SwapProviderProps = { pathParams, isPoolSwap: true, poolTokens }

  return (
    <PoolActionsLayout>
      {isLoading ? null : (
        <SwapLayout props={props}>
          <SwapForm redirectToPoolPage={redirectToPoolPage} />
        </SwapLayout>
      )}
    </PoolActionsLayout>
  )
}

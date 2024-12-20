'use client'

import { Box } from '@chakra-ui/react'
import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { getPoolActionableTokens } from '@repo/lib/modules/pool/pool.helpers'
import { usePoolRedirect } from '@repo/lib/modules/pool/pool.hooks'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { SwapForm } from '@repo/lib/modules/swap/SwapForm'
import SwapLayout from '@repo/lib/modules/swap/SwapLayout'
import { PathParams, SwapProviderProps } from '@repo/lib/modules/swap/SwapProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { Hash } from 'viem'

type Props = {
  params: { txHash?: string[] }
}
// Page for swapping from a pool page
export default function PoolSwapPage({ params: { txHash } }: Props) {
  const { pool } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const poolActionableTokens = getPoolActionableTokens(pool)

  if (poolActionableTokens.length < 2) {
    return (
      <PoolActionsLayout>
        <Box w="50%">
          <BalAlert
            content="You cannot swap the tokens in this pool because we are missing token metadata"
            status="info"
          />
        </Box>
      </PoolActionsLayout>
    )
  }

  const maybeTxHash = (txHash?.[0] as Hash) || undefined

  const pathParams: PathParams = {
    chain: chainToSlugMap[pool.chain],
    tokenIn: poolActionableTokens[0].address,
    tokenOut: poolActionableTokens[1].address,
    urlTxHash: maybeTxHash,
  }
  const props: SwapProviderProps = {
    pathParams,
    pool,
    poolActionableTokens: poolActionableTokens,
  }

  const shouldRenderLayout = !!pool

  return (
    <PoolActionsLayout>
      {shouldRenderLayout ? (
        <SwapLayout props={props}>
          <SwapForm redirectToPoolPage={redirectToPoolPage} />
        </SwapLayout>
      ) : null}
    </PoolActionsLayout>
  )
}

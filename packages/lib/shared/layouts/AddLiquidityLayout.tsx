'use client'

import { shouldBlockAddLiquidity } from '@repo/lib/modules/pool/pool.helpers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { PropsWithChildren } from 'react'
import { isHash } from 'viem'
import { usePoolRedirect } from '@repo/lib/modules/pool/pool.hooks'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { AddLiquidityProvider } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { usePathname } from 'next/navigation'
import { usePoolMetadata } from '@repo/lib/modules/pool/metadata/usePoolMetadata'

type Props = PropsWithChildren<{
  txHash?: string[]
}>

export function AddLiquidityLayout({ txHash, children }: Props) {
  const pathname = usePathname()
  const { pool } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined

  const isMabeetsAddLiquidity = pathname === '/mabeets/add-liquidity'
  const poolMetadata = usePoolMetadata(pool)

  if (shouldBlockAddLiquidity(pool, poolMetadata) && !isMabeetsAddLiquidity) {
    redirectToPoolPage()
    return null
  }

  return (
    <DefaultPageContainer>
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <Permit2SignatureProvider>
            <TokenInputsValidationProvider>
              <AddLiquidityProvider urlTxHash={urlTxHash}>
                <PriceImpactProvider>{children}</PriceImpactProvider>
              </AddLiquidityProvider>
            </TokenInputsValidationProvider>
          </Permit2SignatureProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}

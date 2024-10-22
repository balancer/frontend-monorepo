'use client'

import { isNotSupported, shouldBlockAddLiquidity } from '@repo/lib/modules/pool/pool.helpers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { Alert } from '@chakra-ui/react'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { PropsWithChildren } from 'react'
import { isHash } from 'viem'
import { usePoolRedirect } from '@repo/lib/modules/pool/pool.hooks'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { AddLiquidityProvider } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function AddLiquidityLayout({ params: { txHash }, children }: Props) {
  const { pool } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined

  if (shouldBlockAddLiquidity(pool)) {
    return redirectToPoolPage()
  }

  if (isNotSupported(pool)) {
    return (
      <Alert minW="50%" status="info" w="fit-content">
        This pool type is not currently supported in the Balancer V3 UI
      </Alert>
    )
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

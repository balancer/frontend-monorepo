'use client'

import { PoolActionsLayout } from '@/lib/modules/pool/actions/PoolActionsLayout'
import { RemoveLiquidityForm } from '@/lib/modules/pool/actions/remove-liquidity/form/RemoveLiquidityForm'
import { RemoveLiquidityProvider } from '@/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { RelayerSignatureProvider } from '@/lib/modules/relayer/RelayerSignatureProvider'
import { TransactionStateProvider } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { PriceImpactProvider } from '@/lib/modules/price-impact/PriceImpactProvider'
import { isHash } from 'viem'
import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import { PermitSignatureProvider } from '@/lib/modules/tokens/approvals/permit2/PermitSignatureProvider'

type Props = {
  params: { txHash?: string[] }
}

export default function RemoveLiquidityPage({ params: { txHash } }: Props) {
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined

  return (
    <DefaultPageContainer>
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <PermitSignatureProvider>
            <RemoveLiquidityProvider urlTxHash={urlTxHash}>
              <PoolActionsLayout>
                <PriceImpactProvider>
                  <RemoveLiquidityForm />
                </PriceImpactProvider>
              </PoolActionsLayout>
            </RemoveLiquidityProvider>
          </PermitSignatureProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}

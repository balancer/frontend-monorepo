'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PropsWithChildren } from 'react'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { ReliquaryProvider } from './ReliquaryProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'

export default function ReliquaryProvidersLayout({ children }: PropsWithChildren) {
  const { tokens, isLoadingTokens } = useTokens()

  const poolTokens = tokens.filter(
    t =>
      t.address === sonicNetworkConfig.tokens.addresses.beets ||
      t.address === sonicNetworkConfig.tokens.stakedAsset?.address
  )

  if (!isLoadingTokens && poolTokens.length === 0) throw new Error('Reliquary tokens not found')

  return (
    <TransactionStateProvider>
      <RelayerSignatureProvider>
        <Permit2SignatureProvider>
          <TokenBalancesProvider initTokens={poolTokens}>
            <TokenInputsValidationProvider>
              <ReliquaryProvider>{children}</ReliquaryProvider>
            </TokenInputsValidationProvider>
          </TokenBalancesProvider>
        </Permit2SignatureProvider>
      </RelayerSignatureProvider>
    </TransactionStateProvider>
  )
}

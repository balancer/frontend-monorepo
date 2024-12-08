'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PropsWithChildren } from 'react'
import fantomNetworkConfig from '@repo/lib/config/networks/fantom'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { LstProvider } from './LstProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function LstProvidersLayout({ children }: PropsWithChildren) {
  const { tokens } = useTokens()
  const nativeAsset = tokens.find(
    t =>
      t.address === fantomNetworkConfig.tokens.nativeAsset.address &&
      t.chainId === fantomNetworkConfig.chainId
  )

  if (!nativeAsset) throw new Error('Native asset not found')

  return (
    <TransactionStateProvider>
      <LstProvider>
        <TokenInputsValidationProvider>
          <TokenBalancesProvider initTokens={[nativeAsset]}>
            <PriceImpactProvider>{children}</PriceImpactProvider>
          </TokenBalancesProvider>
        </TokenInputsValidationProvider>
      </LstProvider>
    </TransactionStateProvider>
  )
}

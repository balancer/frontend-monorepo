'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PropsWithChildren } from 'react'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { LoopsProvider } from './LoopsProvider'

export default function LoopsProvidersLayout({ children }: PropsWithChildren) {
  const { tokens, isLoadingTokens } = useTokens()

  const loopTokens = tokens.filter(
    t =>
      (t.address === sonicNetworkConfig.tokens.nativeAsset.address &&
        t.chainId === sonicNetworkConfig.chainId) ||
      t.address === sonicNetworkConfig.tokens.stakedAsset?.address
  )

  if (!isLoadingTokens && loopTokens.length === 0) throw new Error('Loop tokens not found')

  return (
    <TransactionStateProvider>
      {loopTokens.length > 0 && (
        <TokenBalancesProvider initTokens={loopTokens}>
          <TokenInputsValidationProvider>
            <LoopsProvider>
              <PriceImpactProvider>{children}</PriceImpactProvider>
            </LoopsProvider>
          </TokenInputsValidationProvider>
        </TokenBalancesProvider>
      )}
    </TransactionStateProvider>
  )
}

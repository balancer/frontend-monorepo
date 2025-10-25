'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PropsWithChildren } from 'react'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { LoopsProvider } from './LoopsProvider'

export default function LoopsProvidersLayout({ children }: PropsWithChildren) {
  const { tokens, isLoadingTokens } = useTokens()

  const loopedTokens = tokens.filter(
    t =>
      (t.address === sonicNetworkConfig.tokens.nativeAsset.address &&
        t.chainId === sonicNetworkConfig.chainId) ||
      (t.address === sonicNetworkConfig.tokens.loopedAsset?.address &&
        +t.chainId === sonicNetworkConfig.chainId)
  )

  if (!isLoadingTokens && loopedTokens.length === 0) throw new Error('Loop tokens not found')

  return (
    <TransactionStateProvider>
      {loopedTokens.length > 0 && (
        <TokenBalancesProvider initTokens={loopedTokens}>
          <TokenInputsValidationProvider>
            <LoopsProvider>{children}</LoopsProvider>
          </TokenInputsValidationProvider>
        </TokenBalancesProvider>
      )}
    </TransactionStateProvider>
  )
}

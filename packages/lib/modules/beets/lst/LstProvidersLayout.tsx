'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PropsWithChildren } from 'react'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { LstProvider } from './LstProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function LstProvidersLayout({ children }: PropsWithChildren) {
  const { tokens } = useTokens()

  const stakingTokens = tokens.filter(
    t =>
      (t.address === sonicNetworkConfig.tokens.nativeAsset.address &&
        t.chainId === sonicNetworkConfig.chainId) ||
      t.address === sonicNetworkConfig.tokens.stakedAsset?.address
  )

  if (stakingTokens.length === 0) throw new Error('Staking tokens not found')

  return (
    <TransactionStateProvider>
      <TokenBalancesProvider initTokens={stakingTokens}>
        <TokenInputsValidationProvider>
          <LstProvider>
            <PriceImpactProvider>{children}</PriceImpactProvider>
          </LstProvider>
        </TokenInputsValidationProvider>
      </TokenBalancesProvider>
    </TransactionStateProvider>
  )
}

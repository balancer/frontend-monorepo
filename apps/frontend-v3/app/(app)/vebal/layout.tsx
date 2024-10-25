'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { CrossChainSyncProvider } from '@repo/lib/modules/vebal/cross-chain/CrossChainSyncProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLockDataProvider } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'

export default function VebalLayout({ children }: PropsWithChildren) {
  const { vebalBptToken } = useTokens()

  if (!vebalBptToken) throw new Error('vebalBptToken not found')

  return (
    <TokenBalancesProvider initTokens={[vebalBptToken]}>
      <VebalLockDataProvider>
        <CrossChainSyncProvider>
          <TransactionStateProvider>
            <DefaultPageContainer>{children}</DefaultPageContainer>
          </TransactionStateProvider>
        </CrossChainSyncProvider>
      </VebalLockDataProvider>
    </TokenBalancesProvider>
  )
}

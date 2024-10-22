'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'
import { useVebalToken } from '@repo/lib/modules/tokens/TokensProvider'
import { CrossChainSyncProvider } from '@repo/lib/modules/vebal/cross-chain/CrossChainSyncProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLockInfoProvider } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'

export default function VebalLayout({ children }: PropsWithChildren) {
  const vebalBptToken = useVebalToken()

  if (!vebalBptToken) throw new Error('vebalBptToken not found')

  return (
    <TokenBalancesProvider initTokens={[vebalBptToken]}>
      <VebalLockInfoProvider>
        <CrossChainSyncProvider>
          <TransactionStateProvider>
            <DefaultPageContainer>{children}</DefaultPageContainer>
          </TransactionStateProvider>
        </CrossChainSyncProvider>
      </VebalLockInfoProvider>
    </TokenBalancesProvider>
  )
}

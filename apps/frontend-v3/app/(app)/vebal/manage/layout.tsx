'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
// import { CrossChainSyncProvider } from '@bal/lib/vebal/cross-chain/CrossChainSyncProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function VeBALManageLayout({ children }: PropsWithChildren) {
  const { vebalBptToken } = useTokens()

  if (!vebalBptToken) throw new Error('vebalBptToken not found')

  return (
    <TokenBalancesProvider initTokens={[vebalBptToken]}>
      {/* <CrossChainSyncProvider> */}
      <TransactionStateProvider>
        <DefaultPageContainer>{children}</DefaultPageContainer>
      </TransactionStateProvider>
      {/* </CrossChainSyncProvider> */}
    </TokenBalancesProvider>
  )
}

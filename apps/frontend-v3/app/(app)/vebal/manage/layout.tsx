'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function VeBALManageLayout({ children }: PropsWithChildren) {
  const { vebalBptToken, isLoadingTokens } = useTokens()

  if (isLoadingTokens) return undefined

  if (!vebalBptToken) throw new Error('vebalBptToken not found')

  return (
    <TokenBalancesProvider initTokens={[vebalBptToken]}>
      <TransactionStateProvider>
        <DefaultPageContainer>{children}</DefaultPageContainer>
      </TransactionStateProvider>
    </TokenBalancesProvider>
  )
}

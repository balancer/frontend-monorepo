'use client'

import { TokenBalancesProvider } from '@/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import mainnetNetworkConfig from '@/lib/config/networks/mainnet'

import { TransactionStateProvider } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { PropsWithChildren } from 'react'
import { CrossChainSyncProvider } from '@/lib/modules/vebal/cross-chain/CrossChainSyncProvider'

export default function VebalLayout({ children }: PropsWithChildren) {
  const { getTokensByChain } = useTokens()

  const tokens = getTokensByChain(1)

  const vebalBptToken = tokens.find(
    t => t.address === mainnetNetworkConfig.tokens.addresses.veBalBpt
  )

  if (!vebalBptToken) throw new Error('vebalBptToken not found')

  return (
    <TokenBalancesProvider initTokens={[vebalBptToken]}>
      <CrossChainSyncProvider>
        <TransactionStateProvider>
          <DefaultPageContainer minH="100vh">{children}</DefaultPageContainer>
        </TransactionStateProvider>
      </CrossChainSyncProvider>
    </TokenBalancesProvider>
  )
}

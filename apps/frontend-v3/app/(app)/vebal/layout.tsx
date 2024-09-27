'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { PropsWithChildren } from 'react'

export default function VebalLayout({ children }: PropsWithChildren) {
  const { getTokensByChain } = useTokens()

  const tokens = getTokensByChain(1)

  const vebalBptToken = tokens.find(
    t => t.address === mainnetNetworkConfig.tokens.addresses.veBalBpt
  )

  if (!vebalBptToken) throw new Error('vebalBptToken not found')

  return (
    <TokenBalancesProvider initTokens={[vebalBptToken]}>
      <DefaultPageContainer minH="100vh">{children}</DefaultPageContainer>
    </TokenBalancesProvider>
  )
}

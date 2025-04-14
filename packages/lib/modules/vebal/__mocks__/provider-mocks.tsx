import { VebalLockDataProvider } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { fakeTokenBySymbol } from '../../../test/data/all-gql-tokens.fake'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { PropsWithChildren } from 'react'

export function TokenBalancesProviderMock({ children }: PropsWithChildren) {
  const vebalBptToken = fakeTokenBySymbol('B-80BAL-20WETH')

  return (
    <VebalLockDataProvider>
      <TokenBalancesProvider initTokens={[vebalBptToken]}>{children}</TokenBalancesProvider>
    </VebalLockDataProvider>
  )
}

'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PropsWithChildren } from 'react'
import sonicNetworkConfig from '@repo/lib/config/networks/sonic'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { LstProvider } from './LstProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { GqlToken } from '@repo/lib/shared/services/api/generated/graphql'

export default function LstProvidersLayout({ children }: PropsWithChildren) {
  const { tokens } = useTokens()

  // const stakingTokens = tokens.filter(
  //   t =>
  //     (t.address === sonicNetworkConfig.tokens.nativeAsset.address &&
  //       t.chainId === sonicNetworkConfig.chainId) ||
  //     t.address === sonicNetworkConfig.tokens.stakedAsset?.address
  // )

  // TODO: remove this once we have the real tokens from the api
  const stakingTokens = [
    {
      __typename: 'GqlToken',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
      chain: 'SONIC',
      chainId: 146,
      logoURI: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
      priority: 0,
      tradable: true,
      isErc4626: false,
      coingeckoId: null,
      isBufferAllowed: false,
    } as GqlToken,
    {
      __typename: 'GqlToken',
      address: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
      name: 'Beets Staked Sonic',
      symbol: 'stS',
      decimals: 18,
      chain: 'SONIC',
      chainId: 146,
      logoURI: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
      priority: 0,
      tradable: true,
      isErc4626: false,
      coingeckoId: null,
      isBufferAllowed: false,
    } as GqlToken,
  ]

  if (stakingTokens.length === 0) throw new Error('Staking tokens not found')

  return (
    <TransactionStateProvider>
      <LstProvider>
        <TokenInputsValidationProvider>
          <TokenBalancesProvider initTokens={stakingTokens}>
            <PriceImpactProvider>{children}</PriceImpactProvider>
          </TokenBalancesProvider>
        </TokenInputsValidationProvider>
      </LstProvider>
    </TransactionStateProvider>
  )
}

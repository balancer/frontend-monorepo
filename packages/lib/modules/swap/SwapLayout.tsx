'use client'

import { ChainSlug, slugToChainMap } from '@repo/lib/modules/pool/pool.utils'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'
import { PathParams, SwapProvider } from '@repo/lib/modules/swap/SwapProvider'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  pathParams: PathParams
}>

// Layout shared by standard swap page (/swap) and pool swap page (/poolid/swap)
export default function SwapLayout({ pathParams, children }: Props) {
  const { getTokensByChain } = useTokens()
  const initChain = pathParams.chain
    ? slugToChainMap[pathParams.chain as ChainSlug]
    : GqlChain.Mainnet
  const initTokens = pathParams.poolTokens || getTokensByChain(initChain)

  return (
    <TransactionStateProvider>
      <RelayerSignatureProvider>
        <TokenInputsValidationProvider>
          <TokenBalancesProvider initTokens={initTokens}>
            <PriceImpactProvider>
              <SwapProvider pathParams={{ ...pathParams }}>{children}</SwapProvider>
            </PriceImpactProvider>
          </TokenBalancesProvider>
        </TokenInputsValidationProvider>
      </RelayerSignatureProvider>
    </TransactionStateProvider>
  )
}

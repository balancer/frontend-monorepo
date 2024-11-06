'use client'

import { ChainSlug, slugToChainMap } from '@repo/lib/modules/pool/pool.utils'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'
import { SwapProviderProps, SwapProvider } from '@repo/lib/modules/swap/SwapProvider'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PropsWithChildren } from 'react'
import { Permit2SignatureProvider } from '../tokens/approvals/permit2/Permit2SignatureProvider'

type Props = PropsWithChildren<{
  props: SwapProviderProps
}>

// Layout shared by standard swap page (/swap) and pool swap page (/poolid/swap)
export default function SwapLayout({ props, children }: Props) {
  const chain = props.pathParams.chain
  const { getTokensByChain } = useTokens()
  const initChain = chain ? slugToChainMap[chain as ChainSlug] : GqlChain.Mainnet
  const initTokens = props.poolActionableTokens || getTokensByChain(initChain)

  return (
    <TransactionStateProvider>
      <Permit2SignatureProvider>
        <RelayerSignatureProvider>
          <TokenInputsValidationProvider>
            <TokenBalancesProvider initTokens={initTokens}>
              <PriceImpactProvider>
                <SwapProvider params={props}>{children}</SwapProvider>
              </PriceImpactProvider>
            </TokenBalancesProvider>
          </TokenInputsValidationProvider>
        </RelayerSignatureProvider>
      </Permit2SignatureProvider>
    </TransactionStateProvider>
  )
}

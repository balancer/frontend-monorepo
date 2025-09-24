'use client'

import { PoolCreationForm } from '@repo/lib/modules/pool/actions/create/PoolCreationForm'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { PoolCreationFormProvider } from '@repo/lib/modules/pool/actions/create/PoolCreationFormProvider'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useParams } from 'next/navigation'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'

export default function PoolCreationPage() {
  const { getTokensByChain, isLoadingTokens } = useTokens()
  const params = useParams()

  const selectedNetwork = (params.network as string) || PROJECT_CONFIG.defaultNetwork
  const initTokens = getTokensByChain(selectedNetwork.toUpperCase() as GqlChain)

  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        {!isLoadingTokens && (
          <TokenInputsValidationProvider>
            <TokenBalancesProvider initTokens={initTokens}>
              <PriceImpactProvider>
                <PoolCreationFormProvider>
                  <Permit2SignatureProvider>
                    <PoolCreationForm />
                  </Permit2SignatureProvider>
                </PoolCreationFormProvider>
              </PriceImpactProvider>
            </TokenBalancesProvider>
          </TokenInputsValidationProvider>
        )}
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}

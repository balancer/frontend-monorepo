'use client'

import { PoolCreationForm } from '@repo/lib/modules/pool/actions/create/PoolCreationForm'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { PoolFormProvider } from '@repo/lib/modules/pool/actions/create/PoolCreationFormProvider'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useSearchParams } from 'next/navigation'

export default function PoolCreationPage() {
  const { getTokensByChain, isLoadingTokens } = useTokens()
  const searchParams = useSearchParams()

  // the ChooseNetwork component updates params with the selected network
  const networkParam = searchParams.get('network')
  const selectedNetwork = networkParam ? (networkParam as GqlChain) : PROJECT_CONFIG.defaultNetwork
  const initTokens = getTokensByChain(selectedNetwork)

  if (!initTokens) return null

  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        {!isLoadingTokens && (
          <TokenBalancesProvider initTokens={initTokens}>
            <PoolFormProvider>
              <Permit2SignatureProvider>
                <PoolCreationForm />
              </Permit2SignatureProvider>
            </PoolFormProvider>
          </TokenBalancesProvider>
        )}
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}

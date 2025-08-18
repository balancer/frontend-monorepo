'use client'

import { PoolCreationForm } from '@repo/lib/modules/pool/actions/create/PoolCreationForm'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { PoolFormProvider } from '@repo/lib/modules/pool/actions/create/PoolCreationFormProvider'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export default function PoolCreationPage() {
  const { getTokensByChain, isLoadingTokens } = useTokens()

  // TODO: pattern match the way swap page uses url path params to get chain
  const initChain = PROJECT_CONFIG.defaultNetwork
  const initTokens = getTokensByChain(initChain)

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

'use client'

import { PoolCreationForm } from '@repo/lib/modules/pool/actions/create/PoolCreationForm'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import {
  PoolCreationFormProvider,
  usePoolCreationForm,
} from '@repo/lib/modules/pool/actions/create/PoolCreationFormProvider'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'

export default function PoolCreationPage() {
  return (
    <PoolCreationFormProvider>
      <PoolCreationPageContent />
    </PoolCreationFormProvider>
  )
}

function PoolCreationPageContent() {
  const { tokenList, isLoadingTokenList } = usePoolCreationForm()

  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        {!isLoadingTokenList && (
          <TokenInputsValidationProvider>
            <TokenBalancesProvider extTokens={tokenList}>
              <Permit2SignatureProvider>
                <PoolCreationForm />
              </Permit2SignatureProvider>
            </TokenBalancesProvider>
          </TokenInputsValidationProvider>
        )}
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}

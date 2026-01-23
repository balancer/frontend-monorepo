import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { useSignatureStep } from './useSignatureStep'
import { useRecoveredFunds } from './useRecoveredFunds'
import { useClaimSteps } from './useClaimSteps'

type UseRecoveredFundsClaimsResponse = ReturnType<typeof useRecoveredFundsClaimsLogic>
const UseRecoveredFundsClaimsContext = createContext<UseRecoveredFundsClaimsResponse | null>(null)

function useRecoveredFundsClaimsLogic() {
  const { claims } = useRecoveredFunds()

  const { signatureStep, hasAcceptedDisclaimer, setHasAcceptedDisclaimer } = useSignatureStep()
  const claimSteps = useClaimSteps(claims)
  const steps = useTransactionSteps([signatureStep, ...claimSteps])

  return {
    steps,
    hasAcceptedDisclaimer,
    setHasAcceptedDisclaimer,
  }
}

export function RecoveredFundsClaimsProvider({ children }: PropsWithChildren) {
  const hook = useRecoveredFundsClaimsLogic()
  return (
    <UseRecoveredFundsClaimsContext.Provider value={hook}>
      {children}
    </UseRecoveredFundsClaimsContext.Provider>
  )
}

export const useRecoveredFundsClaims = (): UseRecoveredFundsClaimsResponse =>
  useMandatoryContext(UseRecoveredFundsClaimsContext, 'RecoveredFundsClaims')

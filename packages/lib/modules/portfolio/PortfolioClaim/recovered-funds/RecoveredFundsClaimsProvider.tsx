import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { useSignatureStep } from './useSignatureStep'
import { useRecoveredFunds } from './useRecoveredFunds'
import { useClaimSteps } from './useClaimSteps'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getChainId } from '@repo/lib/config/app.config'

type UseRecoveredFundsClaimsResponse = ReturnType<typeof useRecoveredFundsClaimsLogic>
const UseRecoveredFundsClaimsContext = createContext<UseRecoveredFundsClaimsResponse | null>(null)

function useRecoveredFundsClaimsLogic() {
  const { claims } = useRecoveredFunds()

  const signatureChain =
    claims.length > 0 ? claims[0].chainId : getChainId(PROJECT_CONFIG.defaultNetwork)
  const { signatureStep, hasAcceptedDisclaimer, setHasAcceptedDisclaimer } =
    useSignatureStep(signatureChain)
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

import { Button } from '@chakra-ui/react'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'
import { useState } from 'react'

const STEP_ID = 'recovered-funds-signature'

export function useSignatureStep() {
  const { isConnected } = useUserAccount()
  const [signed, setSigned] = useState(false)
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)

  const labels: TransactionLabels = {
    init: 'Sign indemnity release',
    title: 'Sign indemnity release',
    confirming: 'Signing...',
    confirmed: 'Signed!',
    tooltip: 'Sign indemnity release',
  }

  const step: TransactionStep = {
    id: STEP_ID,
    labels,
    stepType: 'signature',
    details: { gasless: true },
    isComplete: () => isConnected && signed,
    renderAction: () => (
      <Button
        isDisabled={!isConnected || !hasAcceptedDisclaimer}
        onClick={() => setSigned(true)}
        size="lg"
        variant="primary"
        w="full"
      >
        <LabelWithIcon icon="sign">Sign indemnity release</LabelWithIcon>
      </Button>
    ),
  }

  return {
    signatureStep: step,
    hasAcceptedDisclaimer,
    setHasAcceptedDisclaimer,
  }
}

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ClaimsSummary } from './ClaimsSummary'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { useRecoveredFundsClaims } from './RecoveredFundsClaimsProvider'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function ClaimRecoveredFundsModal({ isOpen, onClose }: Props) {
  const { isDesktop } = useBreakpoints()
  const { redirectToPage: redirectToPortfolioPage } = useRedirect('/portfolio')
  const { steps } = useRecoveredFundsClaims()
  const isSuccess = steps.isLastStep(steps.currentStepIndex) && steps.currentStep.isComplete()
  const txHash =
    isSuccess && steps.currentTransaction
      ? steps.lastTransaction?.result?.data?.transactionHash
      : undefined

  const closeModal = () => {
    redirectToPortfolioPage()
    onClose()
  }

  return (
    <Modal isCentered isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={GqlChain.Mainnet} isTxBatch={false} transactionSteps={steps} />
        )}

        <TransactionModalHeader
          chain={GqlChain.Mainnet}
          isReceiptLoading={false}
          label="Claim recovered funds from v2 incident"
          txHash={txHash}
        />

        <ModalCloseButton />

        <ModalBody>
          <ClaimsSummary />
        </ModalBody>

        <ActionModalFooter
          currentStep={steps.currentStep}
          isSuccess={isSuccess}
          returnAction={closeModal}
          returnLabel="Go to portfolio page"
          urlTxHash={txHash}
        />
      </ModalContent>
    </Modal>
  )
}

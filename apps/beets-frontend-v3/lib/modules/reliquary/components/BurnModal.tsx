import {
  Card,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalProps,
} from '@chakra-ui/react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBurnRelicStep } from '../hooks/useBurnRelicStep'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  chain: GqlChain
  relicId: string
}

export function BurnModal({
  isOpen,
  onClose,
  chain,
  relicId,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const { isDesktop, isMobile } = useBreakpoints()
  const { step: burnStep } = useBurnRelicStep(relicId, chain)
  const { refetchRelicPositions } = useReliquary()
  const burnTransactionSteps = useTransactionSteps([burnStep], false)
  const burnTxHash = burnTransactionSteps.lastTransaction?.result?.data?.transactionHash

  function handleOnClose() {
    burnTransactionSteps.resetTransactionSteps()
    refetchRelicPositions()
    onClose()
  }

  const isSuccess = !!burnTxHash

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={handleOnClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!burnTxHash} />
      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={burnTransactionSteps} />}
        <TransactionModalHeader
          chain={chain}
          label={`Burn Relic #${relicId}`}
          txHash={burnTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && (
              <MobileStepTracker chain={chain} transactionSteps={burnTransactionSteps} />
            )}
            <Card variant="modalSubSection">
              {isSuccess ? 'Relic burned!' : 'Burn this Relic!'}
            </Card>
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={burnTransactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={handleOnClose}
          returnLabel="Return to maBEETS"
        />
      </ModalContent>
    </Modal>
  )
}

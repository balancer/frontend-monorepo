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
import { useResetStepIndexOnOpen } from '@repo/lib/modules/pool/actions/useResetStepIndexOnOpen'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  chain: GqlChain
  nextLevel: number
}

export function LevelUpModal({
  isOpen,
  onClose,
  chain,
  nextLevel,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const { isDesktop, isMobile } = useBreakpoints()
  const { levelUpTransactionSteps, levelUpTxHash } = useReliquary()

  useResetStepIndexOnOpen(isOpen, levelUpTransactionSteps)

  function handleOnClose() {
    levelUpTransactionSteps.resetTransactionSteps()
    onClose()
  }

  const isSuccess = !!levelUpTxHash

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!levelUpTxHash} />
      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={chain} transactionSteps={levelUpTransactionSteps} />
        )}
        <TransactionModalHeader chain={chain} label="Level Up" txHash={levelUpTxHash} />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && (
              <MobileStepTracker chain={chain} transactionSteps={levelUpTransactionSteps} />
            )}
            <Card variant="modalSubSection">The next level is {nextLevel}!</Card>
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={levelUpTransactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={handleOnClose}
          returnLabel="Return to maBEETS"
        />
      </ModalContent>
    </Modal>
  )
}

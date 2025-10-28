import {
  Card,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalProps,
  Text,
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
}

export function BurnModal({
  isOpen,
  onClose,
  chain,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const { isDesktop, isMobile } = useBreakpoints()

  const {
    burnRelicTransactionSteps: transactionSteps,
    burnRelicTxHash,
    selectedRelic,
  } = useReliquary()

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const isSuccess = !!burnRelicTxHash

  function handleOnClose() {
    transactionSteps.resetTransactionSteps()
    onClose()
  }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!burnRelicTxHash} />
      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={transactionSteps} />}
        <TransactionModalHeader chain={chain} label="Burn Relic" txHash={burnRelicTxHash} />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && <MobileStepTracker chain={chain} transactionSteps={transactionSteps} />}
            <Card variant="modalSubSection">
              <Text>
                {burnRelicTxHash
                  ? `Relic #${selectedRelic?.relicId} has been burned!`
                  : `You are about to burn Relic #${selectedRelic?.relicId}. This action cannot be undone.`}
              </Text>
            </Card>
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={handleOnClose}
          returnLabel="Return to maBEETS"
        />
      </ModalContent>
    </Modal>
  )
}

import { Card, ModalProps, Dialog, Portal } from '@chakra-ui/react';
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useLevelUpStep } from '../hooks/useLevelUpStep'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'

type Props = {
  isOpen: boolean
  onClose(): void
  chain: GqlChain
  nextLevel: number
  relicId: string
}

export function LevelUpModal({
  isOpen,
  onClose,
  chain,
  nextLevel,
  relicId,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const { isDesktop, isMobile } = useBreakpoints()
  const { step: levelUpStep } = useLevelUpStep(relicId)
  const levelUpTransactionSteps = useTransactionSteps([levelUpStep], false)
  const levelUpTxHash = levelUpTransactionSteps.lastTransaction?.result?.data?.transactionHash

  function handleOnClose() {
    levelUpTransactionSteps.resetTransactionSteps()
    onClose()
  }

  const isSuccess = !!levelUpTxHash

  return (
    <Dialog.Root
      placement='center'
      open={isOpen}
      trapFocus={!isSuccess}
      {...rest}
      onOpenChange={(e: any) => {
        if (!e.open) {
          onClose();
        }
      }}>
      <Portal>

        <SuccessOverlay startAnimation={!!levelUpTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && (
              <DesktopStepTracker chain={chain} transactionSteps={levelUpTransactionSteps} />
            )}
            <TransactionModalHeader chain={chain} label="Level Up" txHash={levelUpTxHash} />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <AnimateHeightChange gap="sm">
                {isMobile && (
                  <MobileStepTracker chain={chain} transactionSteps={levelUpTransactionSteps} />
                )}
                <Card.Root variant="modalSubSection">
                  {isSuccess
                    ? `Successfully levelled up to ${nextLevel - 1}.`
                    : `The next level is ${nextLevel}.`}
                </Card.Root>
              </AnimateHeightChange>
            </Dialog.Body>
            <ActionModalFooter
              currentStep={levelUpTransactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={handleOnClose}
              returnLabel="Return to maBEETS"
            />
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}

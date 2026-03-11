import { Card, DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
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
  open: boolean
  onClose(): void
  chain: GqlChain
  relicId: string
}

export function BurnModal({
  open,
  onClose,
  chain,
  relicId,
  ...rest
}: Props & Omit<DialogRootProps, 'children' | 'onClose'>) {
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
    <Dialog.Root
      open={open}
      placement="center"
      trapFocus={!isSuccess}
      {...rest}
      onOpenChange={(e: any) => {
        if (!e.open) {
          handleOnClose()
        }
      }}
    >
      <Portal>
        <SuccessOverlay startAnimation={!!burnTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && (
              <DesktopStepTracker chain={chain} transactionSteps={burnTransactionSteps} />
            )}
            <TransactionModalHeader
              chain={chain}
              label={`Burn Relic #${relicId}`}
              txHash={burnTxHash}
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <AnimateHeightChange gap="sm">
                {isMobile && (
                  <MobileStepTracker chain={chain} transactionSteps={burnTransactionSteps} />
                )}
                <Card.Root variant="modalSubSection">
                  {isSuccess ? 'Relic burned!' : 'Burn this Relic!'}
                </Card.Root>
              </AnimateHeightChange>
            </Dialog.Body>
            <ActionModalFooter
              currentStep={burnTransactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={handleOnClose}
              returnLabel="Return to maBEETS"
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

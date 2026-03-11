import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { SubmitVotesPreview } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/modal/SubmitVotesPreview'
import { useSubmittingVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/useSubmittingVotes'
import { useVotes } from '@bal/lib/vebal/vote/Votes/VotesProvider'

type Props = {
  open: boolean
  onClose(anySuccess: boolean): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function SubmitVotesModal({
  open,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<DialogRootProps, 'children' | 'onClose'>) {
  const { isDesktop, isMobile } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, txHash, totalInfo, timeLockedVotes, unchangedVotes } = useMyVotes()
  const { isPoolGaugeExpired } = useVotes()

  const chain = mainnetNetworkConfig.chain

  const { submittingVotesChunk, previousChunksAllocation, nextChunksAllocation } =
    useSubmittingVotes()

  const handleClose = () => {
    onClose(transactionSteps.steps.some(step => step.isComplete()))
  }

  return (
    <Dialog.Root
      finalFocusEl={() => finalFocusRef?.current ?? null}
      initialFocusEl={() => initialFocusRef.current}
      open={open}
      placement="center"
      size="xl"
      {...rest}
      onOpenChange={(e: any) => {
        if (!e.open) {
          handleClose()
        }
      }}
    >
      <Portal>
        <SuccessOverlay startAnimation={!!txHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={transactionSteps} />}
            <TransactionModalHeader chain={chain} label="Review votes" txHash={txHash} />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <AnimateHeightChange gap="sm">
                {isMobile && (
                  <MobileStepTracker chain={chain} transactionSteps={transactionSteps} />
                )}
                <SubmitVotesPreview
                  changedVotes={submittingVotesChunk || []}
                  isPoolGaugeExpired={isPoolGaugeExpired}
                  nextChunksAllocation={nextChunksAllocation}
                  previousChunksAllocation={previousChunksAllocation}
                  timeLockedVotes={timeLockedVotes}
                  totalInfo={totalInfo}
                  unchangedVotes={unchangedVotes}
                />
              </AnimateHeightChange>
            </Dialog.Body>
            {transactionSteps.currentStep && (
              <ActionModalFooter
                currentStep={transactionSteps.currentStep}
                isSuccess={!!txHash}
                returnAction={handleClose}
                returnLabel="Return to votes"
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

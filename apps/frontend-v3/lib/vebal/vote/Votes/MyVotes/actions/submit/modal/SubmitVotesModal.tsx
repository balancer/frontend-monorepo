'use client'

import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
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
import { useResetStepIndexOnOpen } from '@repo/lib/modules/pool/actions/useResetStepIndexOnOpen'
import { useSubmittingVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/useSubmittingVotes'
import { useVotes } from '@bal/lib/vebal/vote/Votes/VotesProvider'

type Props = {
  isOpen: boolean
  onClose(anySuccess: boolean): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function SubmitVotesModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const { isDesktop, isMobile } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, txHash, totalInfo, timeLockedVotes } = useMyVotes()
  const { isPoolGaugeExpired } = useVotes()

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const chain = mainnetNetworkConfig.chain

  const { submittingVotesChunk, previousChunksAllocation, nextChunksAllocation } =
    useSubmittingVotes()

  const handleClose = () => {
    onClose(transactionSteps.steps.some(step => step.isComplete()))
  }

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={handleClose}
      preserveScrollBarGap
      size="xl"
      {...rest}
    >
      <SuccessOverlay startAnimation={!!txHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={transactionSteps} />}
        <TransactionModalHeader chain={chain} label="Review votes" txHash={txHash} />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && <MobileStepTracker chain={chain} transactionSteps={transactionSteps} />}
            <SubmitVotesPreview
              isPoolGaugeExpired={isPoolGaugeExpired}
              nextChunksAllocation={nextChunksAllocation}
              previousChunksAllocation={previousChunksAllocation}
              submittingVotes={submittingVotesChunk}
              timeLockedVotes={timeLockedVotes}
              totalInfo={totalInfo}
            />
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={!!txHash}
          returnAction={handleClose}
          returnLabel="Return to votes"
        />
      </ModalContent>
    </Modal>
  )
}

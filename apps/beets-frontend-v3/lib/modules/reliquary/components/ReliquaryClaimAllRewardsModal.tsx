import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { ModalProps, Dialog, Portal } from '@chakra-ui/react';
import { RefObject, useRef } from 'react'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useReliquaryClaimAllSteps } from '../hooks/useReliquaryClaimAllSteps'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ReliquaryClaimAllSummary } from './ReliquaryClaimAllSummary'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function ReliquaryClaimAllRewardsModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { pool } = usePool()
  const { isLoadingSteps, steps } = useReliquaryClaimAllSteps()
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)
  const { refetchPendingRewards } = useReliquary()

  const claimTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash
  const isSuccess = !!claimTxHash

  const onCloseModal = () => {
    transactionSteps.resetTransactionSteps()
    refetchPendingRewards()
    onClose()
  }

  return (
    <Dialog.Root
      finalFocusEl={() => finalFocusRef.current}
      initialFocusEl={() => initialFocusRef.current}
      placement='center'
      open={isOpen}
      trapFocus={!isSuccess}
      {...rest}
      onOpenChange={e => {
        if (!e.open) {
          onCloseModal();
        }
      }}>
      <Portal>

        <SuccessOverlay startAnimation={!!claimTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />}
            <TransactionModalHeader chain={pool.chain} label="Claim all rewards" txHash={claimTxHash} />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <ReliquaryClaimAllSummary
                claimTxHash={claimTxHash}
                isLoadingSteps={isLoadingSteps}
                transactionSteps={transactionSteps}
              />
            </Dialog.Body>
            <ActionModalFooter
              currentStep={transactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={onCloseModal}
              returnLabel="Return to maBEETS"
            />
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}

import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { ModalProps, Dialog, Portal } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useReliquaryClaimSteps } from '../hooks/useReliquaryClaimSteps'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ReliquaryClaimSummary } from './ReliquaryClaimSummary'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
  relicId: string
}

export function ReliquaryClaimModal({
  isOpen,
  onClose,
  finalFocusRef,
  relicId,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { pool } = usePool()
  const { isLoadingSteps, steps } = useReliquaryClaimSteps(String(relicId))
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
      finalFocusEl={() => finalFocusRef?.current ?? null}
      initialFocusEl={() => initialFocusRef.current}
      open={isOpen}
      placement="center"
      trapFocus={!isSuccess}
      {...rest}
      onOpenChange={(e: any) => {
        if (!e.open) {
          onCloseModal()
        }
      }}
    >
      <Portal>
        <SuccessOverlay startAnimation={!!claimTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && (
              <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
            )}
            <TransactionModalHeader
              chain={pool.chain}
              label={`Claim rewards from Relic #${relicId}`}
              txHash={claimTxHash}
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <ReliquaryClaimSummary
                claimTxHash={claimTxHash}
                isLoadingSteps={isLoadingSteps}
                relicId={String(relicId)}
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
  )
}

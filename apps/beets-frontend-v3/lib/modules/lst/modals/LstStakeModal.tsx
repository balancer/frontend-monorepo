'use client'

import { ModalProps, Dialog, Portal } from '@chakra-ui/react';
import { RefObject, useEffect, useRef } from 'react'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { useLstStakeReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useLst } from '../LstProvider'
import { LstStakeSummary } from '../components/LstStakeSummary'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function LstStakeModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()
  const { stakeTransactionSteps, chain, lstStakeTxHash, lastTransaction } = useLst()

  const lstStakeReceipt = useLstStakeReceipt({
    txHash: lstStakeTxHash,
    userAddress,
    chain,
    protocolVersion: 2, // TODO: make this optional
    txReceipt: lastTransaction?.result })

  useEffect(() => {
    if (isOpen) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
  }, [isOpen])

  useOnUserAccountChanged(onClose)

  const isSuccess = !!lstStakeTxHash && lstStakeReceipt.hasReceipt

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
          onClose();
        }
      }}>
      <Portal>

        <SuccessOverlay startAnimation={!!lstStakeTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
            <TransactionModalHeader chain={chain} isReceiptLoading label="Review stake" txHash="0x" />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <LstStakeSummary {...lstStakeReceipt} />
            </Dialog.Body>
            <ActionModalFooter
              currentStep={stakeTransactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={onClose}
              returnLabel="Stake again"
            />
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}

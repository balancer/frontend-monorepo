/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useResetStepIndexOnOpen } from '@repo/lib/modules/pool/actions/useResetStepIndexOnOpen'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { useLstUnstakeReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useLst } from '../LstProvider'
import { LstUnstakeSummary } from '../components/LstUnstakeSummary'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
}

export function LstUnstakeModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()
  const { unstakeTransactionSteps, chain, lstUnstakeTxHash } = useLst()

  useResetStepIndexOnOpen(isOpen, unstakeTransactionSteps)

  const lstUnstakeReceipt = useLstUnstakeReceipt({
    txHash: lstUnstakeTxHash,
    userAddress,
    chain,
    protocolVersion: 2, // TODO: make this optional
  })

  useEffect(() => {
    if (isOpen) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
  }, [isOpen])

  useOnUserAccountChanged(onClose)

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!lstUnstakeTxHash} />
      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={chain} transactionSteps={unstakeTransactionSteps} />
        )}
        <TransactionModalHeader chain={chain} isReceiptLoading label="Review unstake" txHash="0x" />
        <ModalCloseButton />
        <ModalBody>
          <LstUnstakeSummary {...lstUnstakeReceipt} />
        </ModalBody>
        <ActionModalFooter
          currentStep={unstakeTransactionSteps.currentStep}
          isSuccess={false}
          returnAction={onClose}
          returnLabel="Unstake again"
        />
      </ModalContent>
    </Modal>
  )
}

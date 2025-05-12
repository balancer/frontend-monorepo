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
import { useLstStakeReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useLst } from '../LstProvider'
import { LstStakeSummary } from '../components/LstStakeSummary'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
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
  const { stakeTransactionSteps, chain, lstStakeTxHash } = useLst()

  useResetStepIndexOnOpen(isOpen, stakeTransactionSteps)

  const lstStakeReceipt = useLstStakeReceipt({
    txHash: lstStakeTxHash,
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

  const isSuccess = !!lstStakeTxHash && !lstStakeReceipt.isLoading

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!lstStakeTxHash} />
      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
        <TransactionModalHeader chain={chain} isReceiptLoading label="Review stake" txHash="0x" />
        <ModalCloseButton />
        <ModalBody>
          <LstStakeSummary {...lstStakeReceipt} />
        </ModalBody>
        <ActionModalFooter
          currentStep={stakeTransactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={onClose}
          returnLabel="Stake again"
        />
      </ModalContent>
    </Modal>
  )
}

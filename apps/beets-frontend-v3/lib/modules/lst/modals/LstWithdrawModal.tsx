'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useLst } from '../LstProvider'
import { LstWithdrawSummary } from '../components/LstWithdrawSummary'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useLstWithdrawReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useResetStepIndexOnOpen } from '@repo/lib/modules/pool/actions/useResetStepIndexOnOpen'

type Props = {
  isOpen: boolean
  onClose(): void
  chain: GqlChain
}

export function LstWithdrawModal({
  isOpen,
  onClose,
  chain,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const { isDesktop } = useBreakpoints()
  const { userAddress } = useUserAccount()
  const { withdrawTransactionSteps, lstWithdrawTxHash, setWithdrawId } = useLst()

  const lstWithdrawReceipt = useLstWithdrawReceipt({
    txHash: lstWithdrawTxHash,
    userAddress,
    chain,
    protocolVersion: 2, // TODO: make this optional
  })

  useResetStepIndexOnOpen(isOpen, withdrawTransactionSteps)

  function handleOnClose() {
    withdrawTransactionSteps.resetTransactionSteps()
    setWithdrawId(0n)
    onClose()
  }

  const isSuccess = !!lstWithdrawTxHash

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={handleOnClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!lstWithdrawTxHash} />
      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={chain} transactionSteps={withdrawTransactionSteps} />
        )}
        <TransactionModalHeader chain={chain} label="Withdraw" txHash={lstWithdrawTxHash} />
        <ModalCloseButton />
        <ModalBody>
          <LstWithdrawSummary {...lstWithdrawReceipt} />
        </ModalBody>
        <ActionModalFooter
          currentStep={withdrawTransactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={handleOnClose}
          returnLabel="Return to withdraw"
        />
      </ModalContent>
    </Modal>
  )
}

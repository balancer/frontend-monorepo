import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useLbpForm } from '../LbpFormProvider'
import { LbpSummary } from './LbpSummary'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { useLbpCreation } from '../LbpCreationProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { usePoolCreationReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function LbpCreationModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const initialFocusRef = useRef(null)
  const { isDesktop } = useBreakpoints()
  const { saleStructureForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const { userAddress } = useUserAccount()
  const { transactionSteps, lastTransaction, initLbpTxHash, urlTxHash } = useLbpCreation()

  const txReceipt = lastTransaction?.result

  // TODO: change to usePoolInitializationReceipt
  const receiptProps = usePoolCreationReceipt({
    txHash: initLbpTxHash,
    chain: selectedChain,
    userAddress: userAddress,
    protocolVersion: 3 as const,
    txReceipt,
  })

  const isSuccess = !!initLbpTxHash

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
      <SuccessOverlay startAnimation={!!initLbpTxHash} />

      <ModalContent>
        {isDesktop && (
          <DesktopStepTracker
            chain={selectedChain}
            // isTxBatch={shouldBatchTransactions} // TODO
            transactionSteps={transactionSteps}
          />
        )}

        <TransactionModalHeader
          chain={selectedChain}
          isReceiptLoading={receiptProps.isLoading}
          label={'Preview: Create an LBP'}
          txHash={initLbpTxHash}
        />

        <ModalCloseButton />
        <ModalBody>
          <LbpSummary />
        </ModalBody>

        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={() => console.log('TODO: navigate to pool page')}
          returnLabel="View pool page" // TODO
          urlTxHash={urlTxHash}
        />
      </ModalContent>
    </Modal>
  )
}

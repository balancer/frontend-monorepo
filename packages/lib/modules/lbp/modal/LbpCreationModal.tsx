import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef, useEffect } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useLbpForm } from '../LbpFormProvider'
import { LbpSummary } from './LbpSummary'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { useLbpCreation } from '../LbpCreationProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { usePoolCreationReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

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
  const [, setPoolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.Address,
    undefined
  )
  const initialFocusRef = useRef(null)
  const { isDesktop } = useBreakpoints()
  const { saleStructureForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const { userAddress } = useUserAccount()
  const { transactionSteps, lastTransaction, createLbpTxHash, urlTxHash } = useLbpCreation()

  const txReceipt = lastTransaction?.result

  const receiptProps = usePoolCreationReceipt({
    txHash: createLbpTxHash,
    chain: selectedChain,
    userAddress: userAddress,
    protocolVersion: 3 as const,
    txReceipt,
  })

  useEffect(() => {
    if (receiptProps.poolAddress) setPoolAddress(receiptProps.poolAddress)
  }, [receiptProps.poolAddress, setPoolAddress])

  const initTxHash = undefined
  const isSuccess = !!initTxHash

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
      <SuccessOverlay startAnimation={!!initTxHash} />

      <ModalContent>
        {isDesktop && (
          <DesktopStepTracker
            chain={selectedChain}
            // isTxBatch={shouldBatchTransactions} // TODO
            transactionSteps={transactionSteps}
          />
        )}

        {saleStructureForm && (
          <TransactionModalHeader
            chain={selectedChain}
            isReceiptLoading={receiptProps.isLoading}
            label={'Preview: Create an LBP'}
            txHash={createLbpTxHash}
          />
        )}
        <ModalCloseButton />
        <ModalBody>
          <LbpSummary />
        </ModalBody>

        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={() => console.log('TODO: navigate to pool page')}
          returnLabel="View pool page" // ???
          urlTxHash={urlTxHash}
        />
      </ModalContent>
    </Modal>
  )
}

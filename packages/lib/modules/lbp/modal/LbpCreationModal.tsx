import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useLbpForm } from '../LbpFormProvider'
import { LbpSummary } from './LbpSummary'

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
  const { saleStructureForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()

  const initTxHash = undefined

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={false}
      //   trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!initTxHash} />

      <ModalContent>
        {saleStructureForm && (
          <TransactionModalHeader
            chain={selectedChain}
            isReceiptLoading={false}
            label={'Preview: Create an LBP'}
            txHash={initTxHash}
          />
        )}
        <ModalCloseButton />
        <ModalBody>
          <LbpSummary />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

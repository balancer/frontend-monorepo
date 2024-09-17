'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { DesktopStepTracker } from '../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useSwap } from '../SwapProvider'
import { SwapTimeout } from './SwapTimeout'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import { capitalize } from 'lodash'
import { ActionModalFooter } from '../../../shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '../../../shared/components/modals/TransactionModalHeader'
import { chainToSlugMap } from '../../pool/pool.utils'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { SuccessOverlay } from '@/lib/shared/components/modals/SuccessOverlay'
import { useResetStepIndexOnOpen } from '../../pool/actions/useResetStepIndexOnOpen'
import { useOnUserAccountChanged } from '../../web3/useOnUserAccountChanged'
import { SwapSummary } from './SwapSummary'
import { useSwapReceipt } from '../../transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '../../web3/UserAccountProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
}

export function SwapPreviewModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { userAddress } = useUserAccount()

  const { transactionSteps, swapAction, isWrap, selectedChain, swapTxHash, hasQuoteContext } =
    useSwap()

  const swapReceipt = useSwapReceipt({
    txHash: swapTxHash,
    userAddress,
    chain: selectedChain,
  })

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  useEffect(() => {
    if (!isWrap && swapTxHash && !window.location.pathname.includes(swapTxHash)) {
      window.history.pushState({}, '', `/swap/${chainToSlugMap[selectedChain]}/${swapTxHash}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapTxHash])

  useOnUserAccountChanged(onClose)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={initialFocusRef}
      finalFocusRef={finalFocusRef}
      isCentered
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!swapTxHash && hasQuoteContext} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}>
        {isDesktop && hasQuoteContext && (
          <DesktopStepTracker transactionSteps={transactionSteps} chain={selectedChain} />
        )}
        <TransactionModalHeader
          label={`Review ${capitalize(swapAction)}`}
          timeout={<SwapTimeout />}
          txHash={swapTxHash}
          chain={selectedChain}
          isReceiptLoading={swapReceipt.isLoading}
        />
        <ModalCloseButton />
        <ModalBody>
          <SwapSummary {...swapReceipt} />
        </ModalBody>
        <ActionModalFooter
          isSuccess={!!swapTxHash && !swapReceipt.isLoading}
          currentStep={transactionSteps.currentStep}
          returnLabel="Swap again"
          returnAction={onClose}
        />
      </ModalContent>
    </Modal>
  )
}

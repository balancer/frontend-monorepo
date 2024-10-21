/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { DesktopStepTracker } from '../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useSwap } from '../SwapProvider'
import { SwapTimeout } from './SwapTimeout'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { capitalize } from 'lodash'
import { ActionModalFooter } from '../../../shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '../../../shared/components/modals/TransactionModalHeader'
import { chainToSlugMap } from '../../pool/pool.utils'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useResetStepIndexOnOpen } from '../../pool/actions/useResetStepIndexOnOpen'
import { useOnUserAccountChanged } from '../../web3/useOnUserAccountChanged'
import { SwapSummary } from './SwapSummary'
import { useSwapReceipt } from '../../transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { useTokens } from '../../tokens/TokensProvider'
import { useIsPoolSwapUrl } from '../useIsPoolSwapUrl'

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
  const isPoolSwapUrl = useIsPoolSwapUrl()
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()

  const {
    transactionSteps,
    swapAction,
    isWrap,
    selectedChain,
    swapTxHash,
    urlTxHash,
    hasQuoteContext,
  } = useSwap()

  const swapReceipt = useSwapReceipt({
    txHash: swapTxHash,
    userAddress,
    chain: selectedChain,
  })

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  useEffect(() => {
    if (!isWrap && swapTxHash && !window.location.pathname.includes(swapTxHash)) {
      const url = isPoolSwapUrl
        ? `${window.location.pathname}/${swapTxHash}`
        : `/swap/${chainToSlugMap[selectedChain]}/${swapTxHash}`
      window.history.pushState({}, '', url)
    }
  }, [swapTxHash])

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
      <SuccessOverlay startAnimation={!!swapTxHash && hasQuoteContext} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}>
        {isDesktop && hasQuoteContext && (
          <DesktopStepTracker chain={selectedChain} transactionSteps={transactionSteps} />
        )}
        <TransactionModalHeader
          chain={selectedChain}
          isReceiptLoading={swapReceipt.isLoading}
          label={`Review ${capitalize(swapAction)}`}
          timeout={<SwapTimeout />}
          txHash={swapTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <SwapSummary {...swapReceipt} />
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={!!swapTxHash && !swapReceipt.isLoading}
          returnAction={onClose}
          returnLabel={isPoolSwapUrl ? 'Return to pool' : 'Swap again'}
          urlTxHash={urlTxHash}
        />
      </ModalContent>
    </Modal>
  )
}

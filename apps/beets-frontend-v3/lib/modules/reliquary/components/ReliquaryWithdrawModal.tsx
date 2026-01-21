'use client'

import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useRemoveLiquidity } from '@repo/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { useRemoveLiquidityReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TxBatchAlert } from '@repo/lib/shared/components/alerts/TxBatchAlert'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { ProtocolVersion } from '@repo/lib/modules/pool/pool.types'
import { ReliquaryWithdrawSummary } from './ReliquaryWithdrawSummary'
import { useRouter } from 'next/navigation'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
  relicId?: string
}

export function ReliquaryWithdrawModal({
  isOpen,
  onClose,
  finalFocusRef,
  relicId,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, lastTransaction, removeLiquidityTxHash, hasQuoteContext, urlTxHash } =
    useRemoveLiquidity()
  const { pool, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling, startTokenPricePolling } = useTokens()
  const router = useRouter()
  const { refetchRelicPositions } = useReliquary()

  const txReceipt = lastTransaction?.result

  const receiptProps = useRemoveLiquidityReceipt({
    chain,
    txHash: removeLiquidityTxHash,
    userAddress,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
    txReceipt,
  })

  useEffect(() => {
    if (isOpen) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
  }, [isOpen])

  useEffect(() => {
    if (removeLiquidityTxHash && !window.location.pathname.includes(removeLiquidityTxHash)) {
      window.history.replaceState({}, '', `./withdraw/${removeLiquidityTxHash}`)
    }
  }, [removeLiquidityTxHash])

  useOnUserAccountChanged(() => {
    onClose()
  })

  const isSuccess = !!removeLiquidityTxHash && receiptProps.hasReceipt

  function baseOnClose() {
    startTokenPricePolling()
    refetchRelicPositions()
    onClose()
  }

  function handleOnClose() {
    router.push(`/mabeets/withdraw/${relicId ? relicId : ''}`)
    baseOnClose()
  }

  function handleReturnAction() {
    router.push(`/mabeets${relicId ? `?focusRelic=${relicId}` : ''}`)
    baseOnClose()
  }

  const modalLabel = relicId ? `Withdraw from Relic #${relicId}` : 'Withdraw from Relic'

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={handleOnClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!removeLiquidityTxHash && hasQuoteContext} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}>
        {isDesktop && hasQuoteContext && (
          <DesktopStepTracker
            chain={pool.chain}
            isTxBatch={shouldBatchTransactions}
            transactionSteps={transactionSteps}
          />
        )}
        <TransactionModalHeader
          chain={pool.chain}
          isReceiptLoading={receiptProps.isLoading}
          label={modalLabel}
          txHash={removeLiquidityTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          {!isSuccess && <TxBatchAlert mb="sm" steps={transactionSteps.steps} />}
          <ReliquaryWithdrawSummary {...receiptProps} relicId={relicId} />
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={handleReturnAction}
          returnLabel="Return to maBEETS"
          urlTxHash={urlTxHash}
        />
      </ModalContent>
    </Modal>
  )
}

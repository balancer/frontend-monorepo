'use client'

import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useAddLiquidity } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { useAddLiquidityReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TxBatchAlert } from '@repo/lib/shared/components/alerts/TxBatchAlert'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { ProtocolVersion } from '@repo/lib/modules/pool/pool.types'
import { ReliquaryDepositSummary } from './ReliquaryDepositSummary'
import { useRouter } from 'next/navigation'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
  createNew: boolean
  relicId?: string
}

export function ReliquaryDepositModal({
  isOpen,
  onClose,
  finalFocusRef,
  createNew,
  relicId,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const {
    transactionSteps,
    lastTransaction,
    addLiquidityTxHash,
    hasQuoteContext,
    urlTxHash,
    setInitialHumanAmountsIn,
  } = useAddLiquidity()
  const { pool, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling, startTokenPricePolling } = useTokens()
  const router = useRouter()

  const txReceipt = lastTransaction?.result

  const receiptProps = useAddLiquidityReceipt({
    chain,
    txHash: addLiquidityTxHash,
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
    if (addLiquidityTxHash && !window.location.pathname.includes(addLiquidityTxHash)) {
      window.history.replaceState({}, '', `./deposit/${addLiquidityTxHash}`)
    }
  }, [addLiquidityTxHash])

  useOnUserAccountChanged(() => {
    setInitialHumanAmountsIn()
    onClose()
  })

  const isSuccess = !!addLiquidityTxHash && receiptProps.hasReceipt

  function handleOnClose() {
    startTokenPricePolling()
    onClose()
    // Return to mabeets page with focus on the deposited Relic
    router.push(`/mabeets${relicId ? `?focusRelic=${relicId}` : ''}`)
  }

  function handleReturnAction() {
    handleOnClose()
  }

  const modalLabel = createNew ? 'Create new Relic & deposit' : `Deposit into Relic #${relicId}`

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
      <SuccessOverlay startAnimation={!!addLiquidityTxHash && hasQuoteContext} />

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
          txHash={addLiquidityTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          {!isSuccess && <TxBatchAlert mb="sm" steps={transactionSteps.steps} />}
          <ReliquaryDepositSummary {...receiptProps} createNew={createNew} relicId={relicId} />
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

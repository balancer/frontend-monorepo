'use client'

import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '../../../PoolProvider'
import { useAddLiquidity } from '../AddLiquidityProvider'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { AddLiquidityTimeout } from './AddLiquidityTimeout'
import { ActionModalFooter } from '../../../../../shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { usePoolRedirect } from '../../../pool.hooks'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useResetStepIndexOnOpen } from '../../useResetStepIndexOnOpen'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { AddLiquiditySummary } from './AddLiquiditySummary'
import { useAddLiquidityReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TxBatchAlert } from '@repo/lib/shared/components/alerts/TxBatchAlert'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { ProtocolVersion } from '../../../pool.types'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
}

export function AddLiquidityModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const {
    transactionSteps,
    addLiquidityTxHash,
    hasQuoteContext,
    urlTxHash,
    setInitialHumanAmountsIn,
  } = useAddLiquidity()
  const { pool, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions(pool)
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()

  const receiptProps = useAddLiquidityReceipt({
    chain,
    txHash: addLiquidityTxHash,
    userAddress,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
  })

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  useEffect(() => {
    if (isOpen) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (addLiquidityTxHash && !window.location.pathname.includes(addLiquidityTxHash)) {
      window.history.replaceState({}, '', `./add-liquidity/${addLiquidityTxHash}`)
    }
  }, [addLiquidityTxHash])

  useOnUserAccountChanged(() => {
    setInitialHumanAmountsIn()
    onClose()
  })

  const isSuccess = !!addLiquidityTxHash && !receiptProps.isLoading

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
          label="Add liquidity"
          timeout={<AddLiquidityTimeout />}
          txHash={addLiquidityTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <TxBatchAlert currentStep={transactionSteps.currentStep} mb="sm" />
          <AddLiquiditySummary {...receiptProps} />
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={redirectToPoolPage}
          returnLabel="Return to pool"
          urlTxHash={urlTxHash}
        />
      </ModalContent>
    </Modal>
  )
}

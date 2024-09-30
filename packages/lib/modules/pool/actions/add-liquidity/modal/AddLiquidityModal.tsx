'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '../../../PoolProvider'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { AddLiquidityTimeout } from './AddLiquidityTimeout'
import { ActionModalFooter } from '../../../../../shared/components/modals/ActionModalFooter'
import { usePoolRedirect } from '../../../pool.hooks'
import { useResetStepIndexOnOpen } from '../../useResetStepIndexOnOpen'
import { AddLiquiditySummary } from './AddLiquiditySummary'
import { SuccessOverlay } from '../../../../../shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '../../../../../shared/components/modals/TransactionModalHeader'
import { useBreakpoints } from '../../../../../shared/hooks/useBreakpoints'
import { useAddLiquidityReceipt } from '../../../../transactions/transaction-steps/receipts/receipt.hooks'
import { DesktopStepTracker } from '../../../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { getStylesForModalContentWithStepTracker } from '../../../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useOnUserAccountChanged } from '../../../../web3/useOnUserAccountChanged'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

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
  const { transactionSteps, addLiquidityTxHash, hasQuoteContext, setInitialHumanAmountsIn } =
    useAddLiquidity()
  const { pool, chain } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { userAddress } = useUserAccount()
  const receiptProps = useAddLiquidityReceipt({
    chain,
    txHash: addLiquidityTxHash,
    userAddress,
  })

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  useEffect(() => {
    if (addLiquidityTxHash && !window.location.pathname.includes(addLiquidityTxHash)) {
      window.history.replaceState({}, '', `./add-liquidity/${addLiquidityTxHash}`)
    }
  }, [addLiquidityTxHash])

  useOnUserAccountChanged(() => {
    setInitialHumanAmountsIn()
    onClose()
  })

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
      <SuccessOverlay startAnimation={!!addLiquidityTxHash && hasQuoteContext} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}>
        {isDesktop && hasQuoteContext && (
          <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
        )}
        <TransactionModalHeader
          label="Add liquidity"
          timeout={<AddLiquidityTimeout />}
          txHash={addLiquidityTxHash}
          chain={pool.chain}
          isReceiptLoading={receiptProps.isLoading}
        />
        <ModalCloseButton />
        <ModalBody>
          <AddLiquiditySummary {...receiptProps} />
        </ModalBody>
        <ActionModalFooter
          isSuccess={!!addLiquidityTxHash && !receiptProps.isLoading}
          currentStep={transactionSteps.currentStep}
          returnLabel="Return to pool"
          returnAction={redirectToPoolPage}
        />
      </ModalContent>
    </Modal>
  )
}

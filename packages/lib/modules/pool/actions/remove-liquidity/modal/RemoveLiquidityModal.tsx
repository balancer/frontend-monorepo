'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '../../../PoolProvider'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { RemoveLiquidityTimeout } from './RemoveLiquidityTimeout'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { usePoolRedirect } from '../../../pool.hooks'
import { useResetStepIndexOnOpen } from '../../useResetStepIndexOnOpen'
import { RemoveLiquiditySummary } from './RemoveLiquiditySummary'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useRemoveLiquidityReceipt } from '../../../../transactions/transaction-steps/receipts/receipt.hooks'
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

export function RemoveLiquidityModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, removeLiquidityTxHash, hasQuoteContext } = useRemoveLiquidity()
  const { pool, chain } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { userAddress } = useUserAccount()

  const receiptProps = useRemoveLiquidityReceipt({
    chain,
    txHash: removeLiquidityTxHash,
    userAddress,
  })

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  useEffect(() => {
    if (removeLiquidityTxHash && !window.location.pathname.includes(removeLiquidityTxHash)) {
      window.history.replaceState({}, '', `./remove-liquidity/${removeLiquidityTxHash}`)
    }
  }, [removeLiquidityTxHash])

  useOnUserAccountChanged(redirectToPoolPage)

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
      <SuccessOverlay startAnimation={!!removeLiquidityTxHash && hasQuoteContext} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}>
        {isDesktop && hasQuoteContext && (
          <DesktopStepTracker transactionSteps={transactionSteps} chain={pool.chain} />
        )}

        <TransactionModalHeader
          label="Remove liquidity"
          timeout={<RemoveLiquidityTimeout />}
          txHash={removeLiquidityTxHash}
          chain={pool.chain}
          isReceiptLoading={receiptProps.isLoading}
        />

        <ModalCloseButton />
        <ModalBody>
          <RemoveLiquiditySummary {...receiptProps} />
        </ModalBody>
        <ActionModalFooter
          isSuccess={!!removeLiquidityTxHash && !receiptProps.isLoading}
          currentStep={transactionSteps.currentStep}
          returnLabel="Return to pool"
          returnAction={redirectToPoolPage}
        />
      </ModalContent>
    </Modal>
  )
}

'use client'

import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '../../../PoolProvider'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { AddLiquidityTimeout } from './AddLiquidityTimeout'
import { ActionModalFooter } from '../../../../../shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { usePoolRedirect } from '../../../pool.hooks'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { AddLiquiditySummary } from './AddLiquiditySummary'
import { useAddLiquidityReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TxBatchAlert } from '@repo/lib/shared/components/alerts/TxBatchAlert'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { ProtocolVersion } from '../../../pool.types'

type Props = {
  open: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function AddLiquidityModal({
  open,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<DialogRootProps, 'children'>) {
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
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()

  const txReceipt = lastTransaction?.result

  const receiptProps = useAddLiquidityReceipt({
    chain,
    txHash: addLiquidityTxHash,
    userAddress,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
    txReceipt,
  })

  useEffect(() => {
    if (open) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
  }, [open])

  useEffect(() => {
    if (addLiquidityTxHash && !window.location.pathname.includes(addLiquidityTxHash)) {
      window.history.replaceState({}, '', `./add-liquidity/${addLiquidityTxHash}`)
    }
  }, [addLiquidityTxHash])

  useOnUserAccountChanged(() => {
    setInitialHumanAmountsIn()
    onClose()
  })

  const isSuccess = !!addLiquidityTxHash && receiptProps.hasReceipt

  return (
    <Dialog.Root
      finalFocusEl={() => finalFocusRef?.current}
      initialFocusEl={() => initialFocusRef.current}
      open={open}
      placement="center"
      trapFocus={!isSuccess}
      {...rest}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <SuccessOverlay startAnimation={!!addLiquidityTxHash && hasQuoteContext} />
        <Dialog.Positioner>
          <Dialog.Content
            {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}
          >
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
            <Dialog.CloseTrigger />
            <Dialog.Body>
              {!isSuccess && <TxBatchAlert mb="sm" steps={transactionSteps.steps} />}
              <AddLiquiditySummary {...receiptProps} />
            </Dialog.Body>
            <ActionModalFooter
              currentStep={transactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={redirectToPoolPage}
              returnLabel="Return to pool"
              urlTxHash={urlTxHash}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

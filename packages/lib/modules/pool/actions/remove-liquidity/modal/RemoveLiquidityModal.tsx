'use client'

import { DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '../../../PoolProvider'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { RemoveLiquidityTimeout } from './RemoveLiquidityTimeout'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { ActionModalFooter } from '../../../../../shared/components/modals/ActionModalFooter'
import { usePoolRedirect } from '../../../pool.hooks'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { RemoveLiquiditySummary } from './RemoveLiquiditySummary'
import { useRemoveLiquidityReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ProtocolVersion } from '../../../pool.types'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { TxBatchAlert } from '@repo/lib/shared/components/alerts/TxBatchAlert'

type Props = {
  open: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function RemoveLiquidityModal({
  open,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<DialogRootProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, removeLiquidityTxHash, urlTxHash, hasQuoteContext, lastTransaction } =
    useRemoveLiquidity()
  const { pool, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()

  const receiptProps = useRemoveLiquidityReceipt({
    chain,
    txHash: removeLiquidityTxHash,
    userAddress,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
    txReceipt: lastTransaction?.result,
  })

  useEffect(() => {
    if (open) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
  }, [open])

  useEffect(() => {
    if (removeLiquidityTxHash && !window.location.pathname.includes(removeLiquidityTxHash)) {
      window.history.replaceState({}, '', `./remove-liquidity/${removeLiquidityTxHash}`)
    }
  }, [removeLiquidityTxHash])

  useOnUserAccountChanged(redirectToPoolPage)

  const isSuccess = !!removeLiquidityTxHash && receiptProps.hasReceipt

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
        <SuccessOverlay startAnimation={!!removeLiquidityTxHash && hasQuoteContext} />
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
              label="Remove liquidity"
              timeout={<RemoveLiquidityTimeout />}
              txHash={removeLiquidityTxHash}
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              {!isSuccess && <TxBatchAlert mb="sm" steps={transactionSteps.steps} />}
              <RemoveLiquiditySummary {...receiptProps} />
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

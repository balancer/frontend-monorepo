import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
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
import { ReliquaryRemoveLiquiditySummary } from './ReliquaryRemoveLiquiditySummary'
import { useRouter } from 'next/navigation'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  open: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
  relicId: string
}

export function ReliquaryRemoveLiquidityModal({
  open,
  onClose,
  finalFocusRef,
  relicId,
  ...rest
}: Props & Omit<DialogRootProps, 'children'>) {
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
    if (open) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
  }, [open])

  useEffect(() => {
    if (removeLiquidityTxHash && !window.location.pathname.includes(removeLiquidityTxHash)) {
      window.history.replaceState(
        {},
        '',
        `/mabeets/remove-liquidity/${relicId}/${removeLiquidityTxHash}`
      )
    }
  }, [removeLiquidityTxHash, relicId])

  useOnUserAccountChanged(() => {
    onClose()
  })

  const isSuccess = !!removeLiquidityTxHash && receiptProps.hasReceipt

  function baseOnClose() {
    transactionSteps.resetTransactionSteps()
    startTokenPricePolling()
    refetchRelicPositions()
    onClose()
  }

  // TODO: refresh 100% amount on close?
  function handleOnClose() {
    router.push(`/mabeets/remove-liquidity/${relicId}`)
    baseOnClose()
  }

  function handleReturnAction() {
    router.push(`/mabeets?focusRelic=${relicId}`)
    baseOnClose()
  }

  const modalLabel = `Remove liquidity from Relic #${relicId}`

  return (
    <Dialog.Root
      finalFocusEl={() => finalFocusRef?.current ?? null}
      initialFocusEl={() => initialFocusRef.current}
      open={open}
      placement="center"
      trapFocus={!isSuccess}
      {...rest}
      onOpenChange={(e: any) => {
        if (!e.open) {
          handleOnClose()
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
              label={modalLabel}
              txHash={removeLiquidityTxHash}
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              {!isSuccess && <TxBatchAlert mb="sm" steps={transactionSteps.steps} />}
              <ReliquaryRemoveLiquiditySummary {...receiptProps} relicId={relicId} />
            </Dialog.Body>
            <ActionModalFooter
              currentStep={transactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={handleReturnAction}
              returnLabel="Return to maBEETS"
              urlTxHash={urlTxHash}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

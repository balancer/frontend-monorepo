import { DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { useLoopsWithdrawReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useLoops } from '@/lib/modules/loops/LoopsProvider'
import { LoopsWithdrawSummary } from '@/lib/modules/loops/components/LoopsWithdrawSummary'

type Props = {
  open: boolean
  onClose(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function LoopsWithdrawModal({
  open,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<DialogRootProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()
  const { withdrawTransactionSteps, chain, loopsWithdrawTxHash, lastTransaction } = useLoops()

  const loopsWithdrawReceipt = useLoopsWithdrawReceipt({
    txHash: loopsWithdrawTxHash,
    userAddress,
    chain,
    protocolVersion: 2, // TODO: make this optional
    txReceipt: lastTransaction?.result,
  })

  useEffect(() => {
    if (open) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
  }, [open])

  useOnUserAccountChanged(onClose)

  const isSuccess = !!loopsWithdrawTxHash && loopsWithdrawReceipt.hasReceipt

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
          onClose()
        }
      }}
    >
      <Portal>
        <SuccessOverlay startAnimation={!!loopsWithdrawTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && (
              <DesktopStepTracker chain={chain} transactionSteps={withdrawTransactionSteps} />
            )}
            <TransactionModalHeader
              chain={chain}
              isReceiptLoading
              label="Review withdrawal"
              txHash={loopsWithdrawTxHash}
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <LoopsWithdrawSummary {...loopsWithdrawReceipt} />
            </Dialog.Body>
            <ActionModalFooter
              currentStep={withdrawTransactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={onClose}
              returnLabel="Withdraw again"
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

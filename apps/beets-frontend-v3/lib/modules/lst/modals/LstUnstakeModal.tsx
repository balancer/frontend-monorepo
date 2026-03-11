'use client'

import { DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useLst } from '../LstProvider'
import { LstUnstakeSummary } from '../components/LstUnstakeSummary'

type Props = {
  open: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function LstUnstakeModal({
  open,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<DialogRootProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { stopTokenPricePolling } = useTokens()
  const { unstakeTransactionSteps, chain, lstUnstakeTxHash, setUnstakeEnabled } = useLst()

  useEffect(() => {
    if (open) {
      stopTokenPricePolling() // stop polling for token prices when modal is opened to prevent unwanted re-renders
      setUnstakeEnabled(true) // enable query for unstake api
    } else {
      setUnstakeEnabled(false) // disable query for unstake api
    }
  }, [open])

  useOnUserAccountChanged(onClose)

  const isSuccess = !!lstUnstakeTxHash

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
        <SuccessOverlay startAnimation={!!lstUnstakeTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && (
              <DesktopStepTracker chain={chain} transactionSteps={unstakeTransactionSteps} />
            )}
            <TransactionModalHeader
              chain={chain}
              isReceiptLoading
              label="Review unstake"
              txHash="0x"
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <LstUnstakeSummary />
            </Dialog.Body>
            <ActionModalFooter
              currentStep={unstakeTransactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={onClose}
              returnLabel="Unstake again"
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

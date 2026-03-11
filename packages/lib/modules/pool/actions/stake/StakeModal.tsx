'use client'

import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { DialogRootProps, Dialog, Portal } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useStake } from './StakeProvider'
import { usePool } from '../../PoolProvider'
import { StakePreview } from './StakePreview'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { usePoolRedirect } from '../../pool.hooks'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'

type Props = {
  open: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function StakeModal({
  open,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<DialogRootProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, stakeTxHash } = useStake()
  const { pool } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { isMobile } = useBreakpoints()

  const isSuccess = !!stakeTxHash

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
        <SuccessOverlay startAnimation={!!stakeTxHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {isDesktop && (
              <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
            )}
            <TransactionModalHeader
              chain={pool.chain}
              label="Stake LP tokens"
              txHash={stakeTxHash}
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <AnimateHeightChange gap="sm">
                {isMobile && (
                  <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
                )}
                <StakePreview />
              </AnimateHeightChange>
            </Dialog.Body>
            <ActionModalFooter
              currentStep={transactionSteps.currentStep}
              isSuccess={isSuccess}
              returnAction={redirectToPoolPage}
              returnLabel="Return to pool"
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

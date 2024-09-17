'use client'

import { DesktopStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@/lib/shared/components/modals/SuccessOverlay'
import { useStake } from './StakeProvider'
import { usePool } from '../../PoolProvider'
import { StakePreview } from './StakePreview'
import { MobileStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { ActionModalFooter } from '@/lib/shared/components/modals/ActionModalFooter'
import { TransactionModalHeader } from '@/lib/shared/components/modals/TransactionModalHeader'
import { usePoolRedirect } from '../../pool.hooks'
import { useResetStepIndexOnOpen } from '../useResetStepIndexOnOpen'
import { AnimateHeightChange } from '@/lib/shared/components/modals/AnimatedModalBody'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
}

export function StakeModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, stakeTxHash } = useStake()
  const { pool } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { isMobile } = useBreakpoints()

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!stakeTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop ? (
          <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
        ) : null}
        <TransactionModalHeader chain={pool.chain} label="Stake LP tokens" txHash={stakeTxHash} />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile ? (
              <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
            ) : null}
            <StakePreview />
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={!!stakeTxHash}
          returnAction={redirectToPoolPage}
          returnLabel="Return to pool"
        />
      </ModalContent>
    </Modal>
  )
}

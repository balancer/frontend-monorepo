'use client'

import { DesktopStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@/lib/shared/components/modals/SuccessOverlay'
import { usePool } from '../../PoolProvider'
import { MobileStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useUnstake } from './UnstakeProvider'
import { UnstakePreview } from './UnstakePreview'
import { TransactionModalHeader } from '@/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@/lib/shared/components/modals/ActionModalFooter'
import { usePoolRedirect } from '../../pool.hooks'
import { useResetStepIndexOnOpen } from '../useResetStepIndexOnOpen'
import { AnimateHeightChange } from '@/lib/shared/components/modals/AnimatedModalBody'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
}

export function UnstakeModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, unstakeTxHash } = useUnstake()
  const { pool } = usePool()
  const { isMobile } = useBreakpoints()
  const { redirectToPoolPage } = usePoolRedirect(pool)

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
      <SuccessOverlay startAnimation={!!unstakeTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop ? (
          <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
        ) : null}
        <TransactionModalHeader
          chain={pool.chain}
          label="Unstake LP tokens"
          txHash={unstakeTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm" w="full">
            {isMobile ? (
              <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
            ) : null}
            <UnstakePreview />
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={!!unstakeTxHash}
          returnAction={redirectToPoolPage}
          returnLabel="Return to pool"
        />
      </ModalContent>
    </Modal>
  )
}
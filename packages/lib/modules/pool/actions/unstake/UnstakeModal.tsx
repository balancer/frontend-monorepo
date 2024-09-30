'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { usePool } from '../../PoolProvider'
import { useUnstake } from './UnstakeProvider'
import { UnstakePreview } from './UnstakePreview'
import { usePoolRedirect } from '../../pool.hooks'
import { useResetStepIndexOnOpen } from '../useResetStepIndexOnOpen'
import { ActionModalFooter } from '../../../../shared/components/modals/ActionModalFooter'
import { AnimateHeightChange } from '../../../../shared/components/modals/AnimatedModalBody'
import { SuccessOverlay } from '../../../../shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '../../../../shared/components/modals/TransactionModalHeader'
import { useBreakpoints } from '../../../../shared/hooks/useBreakpoints'
import { DesktopStepTracker } from '../../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '../../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { getStylesForModalContentWithStepTracker } from '../../../transactions/transaction-steps/step-tracker/step-tracker.utils'

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
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={initialFocusRef}
      finalFocusRef={finalFocusRef}
      isCentered
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!unstakeTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />}
        <TransactionModalHeader
          label="Unstake LP tokens"
          txHash={unstakeTxHash}
          chain={pool.chain}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm" w="full">
            {isMobile && (
              <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
            )}
            <UnstakePreview />
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          isSuccess={!!unstakeTxHash}
          currentStep={transactionSteps.currentStep}
          returnLabel="Return to pool"
          returnAction={redirectToPoolPage}
        />
      </ModalContent>
    </Modal>
  )
}

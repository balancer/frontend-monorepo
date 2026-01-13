'use client'

import {
  Box,
  Card,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalProps,
  Text,
  VStack,
} from '@chakra-ui/react'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useReliquaryDelegationStep, DelegationAction } from '../hooks/useReliquaryDelegationStep'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useState } from 'react'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  isDelegated: boolean // true for delegate, false for undelegate
}

export function ReliquaryDelegationModal({
  isOpen,
  onClose,
  isDelegated,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  // Determine action based on current delegation state
  const [action] = useState<DelegationAction>(isDelegated ? 'undelegate' : 'delegate')

  const { isDesktop, isMobile } = useBreakpoints()
  const { step: delegationStep } = useReliquaryDelegationStep(action)
  const delegationTransactionSteps = useTransactionSteps([delegationStep], false)
  const delegationTxHash = delegationTransactionSteps.lastTransaction?.result?.data?.transactionHash

  const { chain } = useReliquary()
  const networkConfig = getNetworkConfig(chain)

  // For UI labels
  const delegate = action === 'delegate'

  // Get transaction hash
  const txHash = delegationTxHash

  // Check if transaction succeeded
  const isSuccess = !!delegationTxHash

  useOnUserAccountChanged(() => {
    onClose()
  })

  function handleOnClose() {
    delegationTransactionSteps.resetTransactionSteps()
    onClose()
  }

  const modalLabel = action === 'delegate' ? 'Delegate voting power' : 'Remove delegation'

  // Get the actual delegation address (Music Directors)
  const delegateAddress = networkConfig.snapshot?.delegateAddress

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={isSuccess} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={chain} transactionSteps={delegationTransactionSteps} />
        )}
        <TransactionModalHeader chain={GqlChain.Sonic} label={modalLabel} txHash={txHash} />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && (
              <MobileStepTracker chain={chain} transactionSteps={delegationTransactionSteps} />
            )}

            {/* Info Section wrapped in Card */}
            <Card variant="modalSubSection">
              <VStack align="start" spacing="sm" w="full">
                <Text color="gray.400" fontSize="sm">
                  {delegate
                    ? 'Delegate your maBEETS voting power to the Music Directors. This only affects the delegation for the Beets space on Snapshot.'
                    : 'Remove your delegation and manage your own voting power. This only affects the delegation for the Beets space on Snapshot.'}
                </Text>

                {delegate && delegateAddress && (
                  <Box>
                    <Text color="gray.500" fontSize="xs" fontWeight="semibold">
                      Delegate to:
                    </Text>
                    <Text color="gray.500" fontFamily="monospace" fontSize="xs">
                      {delegateAddress}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Card>
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={delegationTransactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={handleOnClose}
          returnLabel="Return to maBEETS"
        />
      </ModalContent>
    </Modal>
  )
}

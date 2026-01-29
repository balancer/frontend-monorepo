import {
  Box,
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ClaimsSummary } from './ClaimsSummary'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { useRecoveredFundsClaims } from './RecoveredFundsClaimsProvider'
import { motion } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'
import { SettlementTerms } from './SettlementTerms'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const MotionFlex = motion(Flex)

export function ClaimRecoveredFundsModal({ isOpen, onClose }: Props) {
  const { isDesktop } = useBreakpoints()
  const { redirectToPage: redirectToPortfolioPage } = useRedirect('/portfolio')

  const [showSettlementTerms, setShowSettlementTerms] = useState(false)
  const measuredRef = useRef<ResizeObserver | null>(null)
  const [maxHeight, setMaxHeight] = useState(0)

  const { steps } = useRecoveredFundsClaims()
  const isSuccess = steps.isLastStep(steps.currentStepIndex) && steps.currentStep.isComplete()
  const txHash =
    isSuccess && steps.currentTransaction
      ? steps.lastTransaction?.result?.data?.transactionHash
      : undefined

  const closeModal = () => {
    redirectToPortfolioPage()
    onClose()
  }

  const summaryRef = useCallback((node: HTMLDivElement | null) => {
    if (measuredRef.current) measuredRef.current.disconnect()

    if (node !== null) {
      const observer = new ResizeObserver(entries => {
        if (entries[0]) {
          setMaxHeight(entries[0].borderBoxSize[0].blockSize)
        }
      })

      observer.observe(node)
      measuredRef.current = observer
    }
  }, [])

  return (
    <Modal isCentered isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={GqlChain.Mainnet} isTxBatch={false} transactionSteps={steps} />
        )}

        <TransactionModalHeader
          chain={GqlChain.Mainnet}
          isReceiptLoading={false}
          label="Claim recovered funds from v2 incident"
          txHash={txHash}
        />

        <ModalCloseButton />

        <ModalBody p={0}>
          <Box overflow="hidden">
            <MotionFlex
              animate={{ x: showSettlementTerms ? '-50%' : '0%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              width="200%"
            >
              <Box p={6} ref={summaryRef} width="50%">
                <ClaimsSummary setShowSettlementTerms={setShowSettlementTerms} />
              </Box>
              <Box maxH={`${maxHeight}px`} overflowY="scroll" p={6} width="50%">
                <SettlementTerms />
              </Box>
            </MotionFlex>
          </Box>
        </ModalBody>

        {showSettlementTerms ? (
          <HStack justifyContent="right" p={6} width="100%">
            <Button onClick={() => setShowSettlementTerms(false)} variant="primary">
              ← Back
            </Button>
          </HStack>
        ) : (
          <ActionModalFooter
            currentStep={steps.currentStep}
            isSuccess={isSuccess}
            returnAction={closeModal}
            returnLabel="Go to portfolio page"
            urlTxHash={txHash}
          />
        )}
      </ModalContent>
    </Modal>
  )
}

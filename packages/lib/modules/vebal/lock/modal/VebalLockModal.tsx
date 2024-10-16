import {
  Card,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalProps,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useVebalLock } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { useResetStepIndexOnOpen } from '@repo/lib/modules/pool/actions/useResetStepIndexOnOpen'
import { Address } from 'viem'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { VebalLockDetails } from '@repo/lib/modules/vebal/lock/VebalLockDetails'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useRouter } from 'next/navigation'
import { useLockStepsPreview } from '@repo/lib/modules/vebal/lock/steps/useLockStepsPreview'
import { getPreviewLabel } from '@repo/lib/modules/vebal/lock/steps/lock.helpers'

type Props = {
  isOpen: boolean
  onClose(isSuccess: boolean): void
  extendExpired: boolean
}

export function VebalLockModal({
  isOpen,
  onClose,
  extendExpired,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const router = useRouter()

  const { isDesktop, isMobile } = useBreakpoints()
  const { vebalToken, totalAmount, lockDuration, lockMode, expectedVeBalAmount } = useVebalLock()
  const { transactionSteps, lockTxHash } = useLockStepsPreview(extendExpired)

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const isLoading = false

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose(!!lockTxHash)
      }}
      isCentered
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!lockTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker transactionSteps={transactionSteps} chain={GqlChain.Mainnet} />
        )}
        <TransactionModalHeader
          label={`${getPreviewLabel(lockMode, extendExpired)} preview`}
          txHash={lockTxHash}
          chain={GqlChain.Mainnet}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="md">
            {isMobile && (
              <MobileStepTracker transactionSteps={transactionSteps} chain={GqlChain.Mainnet} />
            )}
            {isLoading ? (
              <Text>Loading data...</Text>
            ) : (
              <>
                <Stack w="full" direction="column" spacing="sm">
                  <Text>Lock amount</Text>
                  <Card variant="modalSubSection">
                    <TokenRow
                      address={vebalToken.address as Address}
                      chain={GqlChain.Mainnet}
                      value={totalAmount}
                    />
                  </Card>
                </Stack>
                <Stack w="full" direction="column" spacing="sm">
                  <Text>Summary</Text>
                  <Card variant="modalSubSection">
                    <VebalLockDetails
                      variant="summary"
                      lockUntilDateFormatted={lockDuration.lockUntilDateFormatted}
                      totalAmount={totalAmount}
                      expectedVeBalAmount={expectedVeBalAmount}
                    />
                  </Card>
                </Stack>
              </>
            )}
          </AnimateHeightChange>
        </ModalBody>

        <ActionModalFooter
          isSuccess={!!lockTxHash}
          currentStep={transactionSteps.currentStep}
          returnLabel="Return to veBAL manage"
          returnAction={() => {
            onClose(!!lockTxHash)
            router.push('/vebal/manage')
          }}
        />
      </ModalContent>
    </Modal>
  )
}

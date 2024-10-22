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
  const { vebalToken, totalAmount, lockMode } = useVebalLock()
  const { transactionSteps, lockTxHash } = useLockStepsPreview(extendExpired)

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const isLoading = false

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose(!!lockTxHash)
      }}
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!lockTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop ? (
          <DesktopStepTracker chain={GqlChain.Mainnet} transactionSteps={transactionSteps} />
        ) : null}
        <TransactionModalHeader
          chain={GqlChain.Mainnet}
          label={`${getPreviewLabel(lockMode, extendExpired)} preview`}
          txHash={lockTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="md">
            {isMobile ? (
              <MobileStepTracker chain={GqlChain.Mainnet} transactionSteps={transactionSteps} />
            ) : null}
            {isLoading ? (
              <Text>Loading data...</Text>
            ) : (
              <>
                <Stack direction="column" spacing="sm" w="full">
                  <Text>Lock amount</Text>
                  <Card variant="modalSubSection">
                    <TokenRow
                      address={vebalToken.address as Address}
                      chain={GqlChain.Mainnet}
                      value={totalAmount}
                    />
                  </Card>
                </Stack>
                <Stack direction="column" spacing="sm" w="full">
                  <Text>Summary</Text>
                  <Card variant="modalSubSection">
                    <VebalLockDetails variant="summary" />
                  </Card>
                </Stack>
              </>
            )}
          </AnimateHeightChange>
        </ModalBody>

        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={!!lockTxHash}
          returnAction={() => {
            onClose(!!lockTxHash)
            router.push('/vebal/manage')
          }}
          returnLabel="Return to veBAL manage"
        />
      </ModalContent>
    </Modal>
  )
}

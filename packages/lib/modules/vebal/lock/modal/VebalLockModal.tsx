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
import {
  useBuildLockSteps,
  UseBuildLockStepsArgs,
} from '@repo/lib/modules/vebal/lock/steps/useBuildLockSteps'
import { getPreviewLabel } from '@repo/lib/modules/vebal/lock/steps/lock.helpers'
import { useEffect, useState } from 'react'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

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

  const { userAddress, isLoading: userAccountIsLoading } = useUserAccount()
  const { isDesktop, isMobile } = useBreakpoints()
  const {
    vebalBptToken,
    totalAmount,
    lockDuration,
    lockMode,
    isIncreasedLockAmount,
    isLoading: vebalLockIsLoading,
  } = useVebalLock()
  const { mainnetLockedInfo, isLoading: vebalLockDataIsLoading } = useVebalLockData()

  // This value should be static when modal is opened
  const [buildLockStepsArgs, setBuildLockStepsArgs] = useState<UseBuildLockStepsArgs>(() => ({
    extendExpired,
    totalAmount,
    lockDuration: lockDuration,
    isIncreasedLockAmount: isIncreasedLockAmount,
    mainnetLockedInfo: mainnetLockedInfo,
  }))

  // "freeze" useBuildLockSteps args on modal open/close (update value only on userAddress change)
  useEffect(() => {
    setBuildLockStepsArgs({
      extendExpired,
      totalAmount,
      lockDuration: lockDuration,
      isIncreasedLockAmount: isIncreasedLockAmount,
      mainnetLockedInfo: mainnetLockedInfo,
    })
  }, [isOpen, userAddress])

  const { transactionSteps, lockTxHash } = useBuildLockSteps(buildLockStepsArgs)

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const isLoading = vebalLockIsLoading || vebalLockDataIsLoading || userAccountIsLoading

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
                      address={vebalBptToken.address as Address}
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

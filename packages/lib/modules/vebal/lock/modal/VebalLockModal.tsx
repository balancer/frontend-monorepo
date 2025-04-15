import {
  AlertDescription,
  AlertIcon,
  Alert,
  Card,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalProps,
  Stack,
  Text,
  AlertTitle,
  VStack,
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
import { LockMode, useVebalLock } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { useResetStepIndexOnOpen } from '@repo/lib/modules/pool/actions/useResetStepIndexOnOpen'
import { Address } from 'viem'
import { VebalLockDetails } from '@repo/lib/modules/vebal/lock/VebalLockDetails'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useRouter } from 'next/navigation'
import {
  useBuildLockSteps,
  UseBuildLockStepsArgs,
} from '@repo/lib/modules/vebal/lock/steps/useBuildLockSteps'
import { getPreviewLabel } from '@repo/lib/modules/vebal/lock/steps/lock-steps.utils'
import { useEffect, useState } from 'react'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { TokenRowWithDetails } from '@repo/lib/modules/tokens/TokenRow/TokenRowWithDetails'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useVeBalRedirectPath } from '../../vebal-navigation'

type Props = {
  isOpen: boolean
  onClose(isSuccess: boolean, redirectPath: string): void
  extendExpired: boolean
}

export function VebalLockModal({
  isOpen,
  onClose,
  extendExpired,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const router = useRouter()
  const { redirectPath, returnLabel } = useVeBalRedirectPath()

  const { userAddress, isLoading: userAccountIsLoading } = useUserAccount()
  const { isDesktop, isMobile } = useBreakpoints()
  const {
    vebalBptToken,
    totalAmount,
    lpToken,
    lockDuration,
    lockMode,
    isIncreasedLockAmount,
    isLoading: vebalLockIsLoading,
    expectedVeBalAmount,
  } = useVebalLock()
  const { mainnetLockedInfo, isLoading: vebalLockDataIsLoading } = useVebalLockData()

  // This value should be static when modal is opened
  const [buildLockStepsArgs, setBuildLockStepsArgs] = useState<UseBuildLockStepsArgs>(() => ({
    extendExpired,
    totalAmount,
    lockDuration,
    isIncreasedLockAmount,
    mainnetLockedInfo,
  }))

  /*
    When lptoken: we are creating/increasing the lock amount
    When no lptoken: we are unlocking/locking
   */
  const addedAmount = lpToken ? bn(lpToken) : totalAmount
  // "freeze" useBuildLockSteps args on modal open/close (update value only on userAddress change)
  useEffect(() => {
    setBuildLockStepsArgs({
      extendExpired,
      totalAmount: addedAmount,
      lockDuration,
      isIncreasedLockAmount,
      mainnetLockedInfo,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userAddress])

  const { transactionSteps, lockTxHash } = useBuildLockSteps(buildLockStepsArgs)

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const isLoading = vebalLockIsLoading || vebalLockDataIsLoading || userAccountIsLoading

  const isUnlocking = lockMode === LockMode.Unlock && !extendExpired

  const isSuccess = !!lockTxHash

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose(!!lockTxHash, redirectPath)
      }}
      preserveScrollBarGap
      trapFocus={!isSuccess}
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
                {lockMode === LockMode.Unlock && extendExpired && (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>
                      To extend an expired lock, unlock the old one first, then confirm the new
                      lock-up period.
                    </AlertDescription>
                  </Alert>
                )}
                {isUnlocking && (
                  <Alert status="info">
                    <AlertIcon />
                    <VStack alignItems="start" spacing="none">
                      <AlertTitle>Reconsider unlocking?</AlertTitle>
                      <AlertDescription>
                        {/* fix: what should we calculate here? */}
                        Extending your lock to 1 year could generate{' '}
                        {fNum(
                          'token',
                          expectedVeBalAmount.maxLockVeBal
                            .minus(expectedVeBalAmount.totalExpectedVeBal)
                            .toNumber()
                        )}{' '}
                        veBAL from voting incentives, protocol revenue and swap fees.
                      </AlertDescription>
                    </VStack>
                  </Alert>
                )}
                <Stack direction="column" spacing="sm" w="full">
                  <Text>{isUnlocking ? 'Locked amount' : 'Lock amount'}</Text>
                  <Card variant="modalSubSection">
                    <TokenRowWithDetails
                      address={vebalBptToken.address as Address}
                      chain={GqlChain.Mainnet}
                      details={
                        isUnlocking && lockDuration.lockedUntilDateFormatted
                          ? [
                              [
                                <Text fontSize="sm" key={1} variant="secondary">
                                  Lock-up period ended
                                </Text>,
                                <Text fontSize="sm" key={2} variant="secondary">
                                  {lockDuration.lockedUntilDateFormatted}
                                </Text>,
                              ],
                            ]
                          : undefined
                      }
                      value={totalAmount}
                    />
                  </Card>
                </Stack>
                {!isUnlocking && (
                  <Stack direction="column" spacing="sm" w="full">
                    <Text>Summary</Text>
                    <Card variant="modalSubSection">
                      <VebalLockDetails variant="summary" />
                    </Card>
                  </Stack>
                )}
              </>
            )}
          </AnimateHeightChange>
        </ModalBody>

        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={() => {
            onClose(isSuccess, redirectPath)
            router.push(redirectPath)
          }}
          returnLabel={returnLabel}
        />
      </ModalContent>
    </Modal>
  )
}

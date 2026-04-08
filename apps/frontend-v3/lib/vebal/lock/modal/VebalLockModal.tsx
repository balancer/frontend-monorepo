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
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { LockMode, useVebalLock } from '@bal/lib/vebal/lock/VebalLockProvider'
import { Address } from 'viem'
import { VebalLockDetails } from '@bal/lib/vebal/lock/VebalLockDetails'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useRouter } from 'next/navigation'
import {
  useBuildLockSteps,
  UseBuildLockStepsArgs,
} from '@bal/lib/vebal/lock/steps/useBuildLockSteps'
import { getPreviewLabel } from '@bal/lib/vebal/lock/steps/lock-steps.utils'
import { useMemo } from 'react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { TokenRowWithDetails } from '@repo/lib/modules/tokens/TokenRow/TokenRowWithDetails'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useVeBalRedirectPath } from '../../vebal-navigation'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'

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

  const { isLoading: userAccountIsLoading } = useUserAccount()
  const { isDesktop, isMobile } = useBreakpoints()
  const {
    vebalBptToken,
    totalAmount,
    lpToken,
    lockDuration,
    lockMode,
    isIncreasedLockAmount,
    isLoading: vebalLockIsLoading,
  } = useVebalLock()
  const { mainnetLockedInfo, isLoading: vebalLockDataIsLoading } = useVebalLockData()

  /*
    When lptoken: we are creating/increasing the lock amount
    When no lptoken: we are unlocking/locking
   */
  const addedAmount = lpToken ? bn(lpToken) : totalAmount

  const buildLockStepsArgs = useMemo<UseBuildLockStepsArgs>(
    () => ({
      extendExpired,
      totalAmount: addedAmount,
      lockDuration,
      isIncreasedLockAmount,
      mainnetLockedInfo,
    }),
    [addedAmount, extendExpired, isIncreasedLockAmount, lockDuration, mainnetLockedInfo]
  )

  const { transactionSteps, lockTxHash } = useBuildLockSteps(buildLockStepsArgs)

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

        {transactionSteps.currentStep && (
          <ActionModalFooter
            currentStep={transactionSteps.currentStep}
            isSuccess={isSuccess}
            returnAction={() => {
              onClose(isSuccess, redirectPath)
              router.push(redirectPath)
            }}
            returnLabel={returnLabel}
          />
        )}
      </ModalContent>
    </Modal>
  )
}

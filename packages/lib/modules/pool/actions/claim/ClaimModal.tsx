import {
  Card,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalProps,
  Text,
} from '@chakra-ui/react'
import { useClaim } from './ClaimProvider'
import { Address } from 'viem'
import { HumanAmount } from '@balancer/sdk'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useMemo } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useResetStepIndexOnOpen } from '../useResetStepIndexOnOpen'
import { useRouter } from 'next/navigation'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'

type Props = {
  isOpen: boolean
  onClose(isSuccess: boolean): void
  chain: GqlChain
}

export function ClaimModal({
  isOpen,
  onClose,
  chain,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const router = useRouter()

  const { isDesktop, isMobile } = useBreakpoints()
  const { transactionSteps, claimTxHash, allClaimableRewards, totalClaimableUsd, isLoading } =
    useClaim()

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const rewards = useMemo(
    () =>
      allClaimableRewards
        .map(reward => ({
          humanAmount: (reward?.humanBalance || '0') as HumanAmount,
          tokenAddress: (reward?.tokenAddress || '') as Address,
        }))
        .filter(Boolean) as HumanTokenAmountWithAddress[],
    [allClaimableRewards]
  )

  const isSuccess = !!claimTxHash

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose(!!claimTxHash)
      }}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!claimTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={transactionSteps} />}
        <TransactionModalHeader chain={chain} label="Claim incentives" txHash={claimTxHash} />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && <MobileStepTracker chain={chain} transactionSteps={transactionSteps} />}
            {isLoading ? (
              <Text>Loading data...</Text>
            ) : rewards.length === 0 ? (
              <Text>Nothing to claim</Text>
            ) : (
              <Card variant="modalSubSection">
                <TokenRowGroup
                  amounts={rewards}
                  chain={chain}
                  label={claimTxHash ? 'You got' : "You'll get"}
                  totalUSDValue={totalClaimableUsd}
                />
              </Card>
            )}
            {claimTxHash && (
              <GasCostSummaryCard chain={chain} transactionSteps={transactionSteps.steps} />
            )}
          </AnimateHeightChange>
        </ModalBody>

        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={() => {
            onClose(isSuccess)
            router.push('/portfolio')
          }}
          returnLabel="Return to portfolio"
        />
      </ModalContent>
    </Modal>
  )
}

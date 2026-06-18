'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, Card } from '@chakra-ui/react'
import { usePortfolio } from '@repo/lib/modules/portfolio/PortfolioProvider'
import { GqlChainValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { Address } from 'viem'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { DesktopStepTracker } from '../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useTransactionSteps } from '../../transactions/transaction-steps/useTransactionSteps'
import { bn } from '@repo/lib/shared/utils/numbers'
import { getStylesForModalContentWithStepTracker } from '../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { TokenRowGroup } from '../../tokens/TokenRow/TokenRowGroup'
import { HumanTokenAmount } from '../../tokens/token.types'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useClaimVeBalRewardsStep } from '../../pool/actions/claim/useClaimVeBalRewardsStep'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'

type Props = {
  isOpen: boolean
  onClose(): void
}

export default function ClaimProtocolRevenueModal({ isOpen, onClose }: Props) {
  const { protocolRewardsData, protocolRewardsBalance, refetchProtocolRewards } = usePortfolio()
  const { isDesktop, isMobile } = useBreakpoints()

  const step = useClaimVeBalRewardsStep({ onSuccess: refetchProtocolRewards })
  const transactionSteps = useTransactionSteps([step])

  const claimTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  const rewards: HumanTokenAmount[] = protocolRewardsData
    .filter(reward => !bn(reward.balance).isZero())
    .sort((a, b) => b.fiatBalance.minus(a.fiatBalance).toNumber())
    .map(reward => ({
      tokenAddress: reward.tokenAddress as Address,
      humanAmount: reward.humanBalance,
    }))

  const isSuccess = !!claimTxHash

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} preserveScrollBarGap trapFocus={!isSuccess}>
      <SuccessOverlay startAnimation={!!claimTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={GqlChainValues.Mainnet} transactionSteps={transactionSteps} />
        )}
        <TransactionModalHeader
          chain={GqlChainValues.Mainnet}
          label="Claim protocol revenue share"
          txHash={claimTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm" w="full">
            {isMobile && (
              <MobileStepTracker
                chain={GqlChainValues.Mainnet}
                transactionSteps={transactionSteps}
              />
            )}

            <Card variant="modalSubSection">
              <TokenRowGroup
                amounts={rewards}
                chain={GqlChainValues.Mainnet}
                label={claimTxHash ? 'You got' : "You'll get"}
                totalUSDValue={protocolRewardsBalance.toString()}
              />
            </Card>
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={onClose}
          returnLabel="Return to portfolio"
        />
      </ModalContent>
    </Modal>
  )
}

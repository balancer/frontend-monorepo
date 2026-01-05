'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, Card } from '@chakra-ui/react'
import { usePortfolio } from '@repo/lib/modules/portfolio/PortfolioProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
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
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useClaimHiddenHandRewardsStep } from '../../pool/actions/claim/useClaimHiddenHandRewardsStep'
import { HumanAmount } from '@balancer/sdk'

type Props = {
  isOpen: boolean
  onClose(): void
}

export default function ClaimHiddenHandRewardsModal({ isOpen, onClose }: Props) {
  const { hiddenHandRewardsData, refetchHiddenHandRewards } = usePortfolio()
  const { isDesktop, isMobile } = useBreakpoints()

  const step = useClaimHiddenHandRewardsStep({ onSuccess: refetchHiddenHandRewards })
  const transactionSteps = useTransactionSteps([step])
  const claimTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  const rewards: HumanTokenAmount[] = (() => {
    if (!hiddenHandRewardsData?.data) return []

    const aggregatedRewards = hiddenHandRewardsData.data
      .filter(reward => bn(reward.claimable).gt(0))
      .reduce(
        (acc, reward) => {
          const tokenAddress = reward.token as Address
          if (!acc[tokenAddress]) {
            acc[tokenAddress] = {
              tokenAddress,
              claimable: '0',
              value: 0,
            }
          }
          acc[tokenAddress].claimable = bn(acc[tokenAddress].claimable)
            .plus(reward.claimable)
            .toString()
          acc[tokenAddress].value += reward.value
          return acc
        },
        {} as Record<Address, { tokenAddress: Address; claimable: string; value: number }>
      )

    return Object.values(aggregatedRewards)
      .sort((a, b) => b.value - a.value)
      .map(reward => ({
        tokenAddress: reward.tokenAddress,
        humanAmount: reward.claimable as HumanAmount,
      }))
  })()

  const isSuccess = !!claimTxHash

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} preserveScrollBarGap trapFocus={!isSuccess}>
      <SuccessOverlay startAnimation={!!claimTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker chain={GqlChain.Mainnet} transactionSteps={transactionSteps} />
        )}
        <TransactionModalHeader
          chain={GqlChain.Mainnet}
          label="Claim Hidden Hand rewards"
          txHash={claimTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm" w="full">
            {isMobile && (
              <MobileStepTracker chain={GqlChain.Mainnet} transactionSteps={transactionSteps} />
            )}

            <Card variant="modalSubSection">
              <TokenRowGroup
                amounts={rewards}
                chain={GqlChain.Mainnet}
                label="You'll get"
                totalUSDValue={hiddenHandRewardsData?.totalValueUsd?.toString() || '0'}
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

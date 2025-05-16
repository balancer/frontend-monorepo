'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, Card } from '@chakra-ui/react'
import { UsePortfolio, usePortfolio } from '@repo/lib/modules/portfolio/PortfolioProvider'
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
import { useClaimVeBalRewardsStep } from '../../pool/actions/claim/useClaimVeBalRewardsStep'
import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'

type Props = {
  isOpen: boolean
  onClose(): void
}

export default function ClaimProtocolRevenueModal({ isOpen, onClose }: Props) {
  const { protocolRewardsData, protocolRewardsBalance, refetchProtocolRewards } = usePortfolio()
  const { isDesktop, isMobile } = useBreakpoints()
  const [rewardsDataSnapshot, setRewardsDataSnapshot] = useState<
    UsePortfolio['protocolRewardsData']
  >([])
  const [rewardsBalanceSnapshot, setRewardsBalanceSnapshot] = useState<BigNumber>(bn(0))

  const step = useClaimVeBalRewardsStep({ onSuccess: refetchProtocolRewards })
  const transactionSteps = useTransactionSteps([step])

  useEffect(() => {
    if (protocolRewardsData.length > 0 && rewardsDataSnapshot.length === 0) {
      setRewardsDataSnapshot(protocolRewardsData)
    }
  }, [protocolRewardsData, rewardsDataSnapshot.length])

  useEffect(() => {
    if (protocolRewardsBalance.isGreaterThan(0) && rewardsBalanceSnapshot.isEqualTo(0)) {
      setRewardsBalanceSnapshot(protocolRewardsBalance)
    }
  }, [protocolRewardsBalance, rewardsBalanceSnapshot])

  const claimTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  const rewards: HumanTokenAmount[] = rewardsDataSnapshot
    .filter(reward => !bn(reward.balance).isZero())
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
          <DesktopStepTracker chain={GqlChain.Mainnet} transactionSteps={transactionSteps} />
        )}
        <TransactionModalHeader
          chain={GqlChain.Mainnet}
          label="Claim protocol revenue share"
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
                label={claimTxHash ? 'You got' : "You'll get"}
                totalUSDValue={rewardsBalanceSnapshot.toString()}
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

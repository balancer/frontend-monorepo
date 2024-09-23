'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, Card } from '@chakra-ui/react'
import { UsePortfolio, usePortfolio } from '@/lib/modules/portfolio/PortfolioProvider'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import { DesktopStepTracker } from '../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useTransactionSteps } from '../../transactions/transaction-steps/useTransactionSteps'
import { bn } from '@/lib/shared/utils/numbers'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { TransactionModalHeader } from '@/lib/shared/components/modals/TransactionModalHeader'
import { TokenRowGroup } from '../../tokens/TokenRow/TokenRowGroup'
import { HumanTokenAmountWithAddress } from '../../tokens/token.types'
import { ActionModalFooter } from '@/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@/lib/shared/components/modals/SuccessOverlay'
import { useClaimVeBalRewardsStep } from '../../pool/actions/claim/useClaimVeBalRewardsStep'
import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { AnimateHeightChange } from '@/lib/shared/components/animations/AnimateHeightChange'

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

  const rewards: HumanTokenAmountWithAddress[] = rewardsDataSnapshot
    .filter(reward => !bn(reward.balance).isZero())
    .map(reward => ({
      tokenAddress: reward.tokenAddress as Address,
      humanAmount: reward.humanBalance,
    }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered preserveScrollBarGap>
      <SuccessOverlay startAnimation={!!claimTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && (
          <DesktopStepTracker transactionSteps={transactionSteps} chain={GqlChain.Mainnet} />
        )}
        <TransactionModalHeader
          label="Claim protocol revenue share"
          txHash={claimTxHash}
          chain={GqlChain.Mainnet}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm" w="full">
            {isMobile && (
              <MobileStepTracker transactionSteps={transactionSteps} chain={GqlChain.Mainnet} />
            )}

            <Card variant="modalSubSection">
              <TokenRowGroup
                label={claimTxHash ? 'You got' : "You'll get"}
                amounts={rewards}
                totalUSDValue={rewardsBalanceSnapshot.toString()}
                chain={GqlChain.Mainnet}
              />
            </Card>
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          isSuccess={!!claimTxHash}
          currentStep={transactionSteps.currentStep}
          returnLabel="Return to portfolio"
          returnAction={onClose}
        />
      </ModalContent>
    </Modal>
  )
}

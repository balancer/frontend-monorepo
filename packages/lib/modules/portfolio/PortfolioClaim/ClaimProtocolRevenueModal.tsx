'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, Card } from '@chakra-ui/react'
import { Address } from 'viem'
import { DesktopStepTracker } from '../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useTransactionSteps } from '../../transactions/transaction-steps/useTransactionSteps'
import { bn } from '../../../shared/utils/numbers'
import { getStylesForModalContentWithStepTracker } from '../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { ActionModalFooter } from '../../../shared/components/modals/ActionModalFooter'
import { AnimateHeightChange } from '../../../shared/components/modals/AnimatedModalBody'
import { SuccessOverlay } from '../../../shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '../../../shared/components/modals/TransactionModalHeader'
import { useBreakpoints } from '../../../shared/hooks/useBreakpoints'
import { GqlChain } from '../../../shared/services/api/generated/graphql'
import { useClaimVeBalRewardsStep } from '../../pool/actions/claim/useClaimVeBalRewardsStep'
import { HumanTokenAmountWithAddress } from '../../tokens/token.types'
import { TokenRowGroup } from '../../tokens/TokenRow/TokenRowGroup'
import { usePortfolio, UsePortfolio } from '../PortfolioProvider'

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
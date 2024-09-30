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
import { useEffect, useMemo, useState } from 'react'
import { useResetStepIndexOnOpen } from '../useResetStepIndexOnOpen'
import { useRouter } from 'next/navigation'
import { ActionModalFooter } from '../../../../shared/components/modals/ActionModalFooter'
import { AnimateHeightChange } from '../../../../shared/components/modals/AnimatedModalBody'
import { SuccessOverlay } from '../../../../shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '../../../../shared/components/modals/TransactionModalHeader'
import { useBreakpoints } from '../../../../shared/hooks/useBreakpoints'
import { GqlChain } from '../../../../shared/services/api/generated/graphql'
import { HumanTokenAmountWithAddress } from '../../../tokens/token.types'
import { TokenRowGroup } from '../../../tokens/TokenRow/TokenRowGroup'
import { DesktopStepTracker } from '../../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '../../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { getStylesForModalContentWithStepTracker } from '../../../transactions/transaction-steps/step-tracker/step-tracker.utils'

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

  const [quoteRewards, setQuoteRewards] = useState<HumanTokenAmountWithAddress[]>([])
  const [quoteTotalUsd, setQuoteTotalUsd] = useState<string>('0')

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

  useEffect(() => {
    if (quoteRewards.length === 0 && rewards.length > 0) {
      setQuoteRewards(rewards)
      setQuoteTotalUsd(totalClaimableUsd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards])

  const noQuoteRewards = quoteRewards.length === 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose(!!claimTxHash)
      }}
      isCentered
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!claimTxHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker transactionSteps={transactionSteps} chain={chain} />}
        <TransactionModalHeader label="Claim incentives" txHash={claimTxHash} chain={chain} />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && <MobileStepTracker transactionSteps={transactionSteps} chain={chain} />}
            {isLoading ? (
              <Text>Loading data...</Text>
            ) : noQuoteRewards ? (
              <Text>Nothing to claim</Text>
            ) : (
              <Card variant="modalSubSection">
                <TokenRowGroup
                  amounts={quoteRewards}
                  chain={chain}
                  label={claimTxHash ? 'You got' : "You'll get"}
                  totalUSDValue={quoteTotalUsd}
                />
              </Card>
            )}
          </AnimateHeightChange>
        </ModalBody>

        <ActionModalFooter
          isSuccess={!!claimTxHash}
          currentStep={transactionSteps.currentStep}
          returnLabel="Return to portfolio"
          returnAction={() => {
            onClose(!!claimTxHash)
            router.push('/portfolio')
          }}
        />
      </ModalContent>
    </Modal>
  )
}

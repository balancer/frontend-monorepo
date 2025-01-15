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
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useEffect, useMemo, useState } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useResetStepIndexOnOpen } from '../useResetStepIndexOnOpen'
import { useRouter } from 'next/navigation'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'

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

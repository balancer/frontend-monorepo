import {
  Card,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalProps,
  Text,
} from '@chakra-ui/react'
import { formatUnits } from 'viem'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useResetStepIndexOnOpen } from '@repo/lib/modules/pool/actions/useResetStepIndexOnOpen'
import { useReliquary } from '../ReliquaryProvider'
import { useGetPendingReward } from '../hooks/useGetPendingReward'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'

type Props = {
  isOpen: boolean
  onClose(): void
  chain: GqlChain
}

export function ClaimModal({
  isOpen,
  onClose,
  chain,
  ...rest
}: Props & Omit<ModalProps, 'children' | 'onClose'>) {
  const { isDesktop, isMobile } = useBreakpoints()

  const {
    claimRewardsTransactionSteps: transactionSteps,
    claimRewardsTxHash,
    selectedRelic,
  } = useReliquary()

  const { amount, refetch } = useGetPendingReward(chain, selectedRelic?.relicId)

  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  const isSuccess = !!claimRewardsTxHash

  function handleOnClose() {
    refetch()
    onClose()
  }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!claimRewardsTxHash} />
      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {isDesktop && <DesktopStepTracker chain={chain} transactionSteps={transactionSteps} />}
        <TransactionModalHeader
          chain={chain}
          label="Claim incentives"
          txHash={claimRewardsTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm">
            {isMobile && <MobileStepTracker chain={chain} transactionSteps={transactionSteps} />}
            {!amount ? (
              <Text>Nothing to claim</Text>
            ) : (
              <Card variant="modalSubSection">
                <TokenRow
                  address={config.tokens.addresses.beets || '0x'}
                  chain={chain}
                  label={claimRewardsTxHash ? 'You got' : "You'll get"}
                  value={formatUnits(amount || 0n, 18)}
                />
              </Card>
            )}
          </AnimateHeightChange>
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={handleOnClose}
          returnLabel="Return to maBEETS"
        />
      </ModalContent>
    </Modal>
  )
}

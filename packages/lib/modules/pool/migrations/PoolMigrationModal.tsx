import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { getStylesForModalContentWithStepTracker } from '../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useRemoveLiquidity } from '../actions/remove-liquidity/RemoveLiquidityProvider'
import { DesktopStepTracker } from '../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { usePoolRedirect } from '../pool.hooks'
import { useOnUserAccountChanged } from '../../web3/useOnUserAccountChanged'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useRemoveLiquidityReceipt } from '../../transactions/transaction-steps/receipts/receipt.hooks'
import { Pool, ProtocolVersion } from '../pool.types'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { MigrateLiquiditySummary } from './MigrateLiquiditySummary'
import { useMigrateLiquidity } from './MigrateLiquidityProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function PoolMigrationModal() {
  const { isDesktop } = useBreakpoints()
  const { userAddress } = useUserAccount()
  const { oldPool, migrationSteps } = useMigrateLiquidity()
  const { hasQuoteContext, removeLiquidityTxHash, lastTransaction, urlTxHash } =
    useRemoveLiquidity()

  const { redirectToPoolPage } = usePoolRedirect(oldPool as Pool)
  useOnUserAccountChanged(redirectToPoolPage)

  const removeLiquidityReceipt = useRemoveLiquidityReceipt({
    chain: oldPool?.chain || GqlChain.Mainnet,
    txHash: removeLiquidityTxHash,
    userAddress,
    protocolVersion: oldPool?.protocolVersion as ProtocolVersion,
    txReceipt: lastTransaction?.result,
  })

  const isSuccess = !!removeLiquidityTxHash && removeLiquidityReceipt.hasReceipt // FIXME: [JUANJO] just check last tx?

  // TODO: [JUANJO] add tx batching
  // TODO: [JUANJO] add refresh countdown (refactor other actions timeout component)
  // TODO: [JUANJO] for now we are just checking the remove liquidity info (hash, receipts, success)

  return (
    <Modal isCentered isOpen={true} onClose={redirectToPoolPage}>
      <ModalOverlay />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}>
        {isDesktop && hasQuoteContext && (
          <DesktopStepTracker
            chain={oldPool?.chain || GqlChain.Mainnet}
            isTxBatch={false}
            transactionSteps={migrationSteps}
          />
        )}

        <TransactionModalHeader
          chain={oldPool?.chain || GqlChain.Mainnet}
          isReceiptLoading={removeLiquidityReceipt.isLoading}
          label="Migrate liquidity"
          txHash={removeLiquidityTxHash}
        />

        <ModalCloseButton />

        <ModalBody>
          <MigrateLiquiditySummary />
        </ModalBody>

        <ActionModalFooter
          currentStep={migrationSteps.currentStep}
          isSuccess={isSuccess}
          returnAction={redirectToPoolPage}
          returnLabel="Return to pool"
          urlTxHash={urlTxHash}
        />
      </ModalContent>
    </Modal>
  )
}

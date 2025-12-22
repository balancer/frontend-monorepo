import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { getStylesForModalContentWithStepTracker } from '../../transactions/transaction-steps/step-tracker/step-tracker.utils'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { DesktopStepTracker } from '../../transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { usePoolRedirect } from '../pool.hooks'
import { useOnUserAccountChanged } from '../../web3/useOnUserAccountChanged'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useAddLiquidityReceipt } from '../../transactions/transaction-steps/receipts/receipt.hooks'
import { Pool, ProtocolVersion } from '../pool.types'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { MigrateLiquiditySummary } from './MigrateLiquiditySummary'
import { useMigrateLiquidity } from './MigrateLiquidityProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useAddLiquidity } from '../actions/add-liquidity/AddLiquidityProvider'

export function PoolMigrationModal() {
  const { isDesktop } = useBreakpoints()
  const { userAddress } = useUserAccount()
  const { oldPool, migrationSteps, hasQuoteContext } = useMigrateLiquidity()
  const { addLiquidityTxHash, urlTxHash, lastTransaction: addLiquidityTx } = useAddLiquidity()

  const { redirectToPoolPage } = usePoolRedirect(oldPool as Pool)
  useOnUserAccountChanged(redirectToPoolPage)

  const addLiquidityReceipt = useAddLiquidityReceipt({
    chain: oldPool?.chain || GqlChain.Mainnet,
    txHash: addLiquidityTxHash,
    userAddress,
    protocolVersion: oldPool?.protocolVersion as ProtocolVersion,
    txReceipt: addLiquidityTx?.result,
  })

  const isSuccess = !!addLiquidityTxHash && addLiquidityReceipt.hasReceipt

  // TODO: [JUANJO] add tx batching
  // TODO: [JUANJO] add refresh countdown (refactor other actions timeout component)

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
          isReceiptLoading={addLiquidityReceipt.isLoading}
          label="Migrate liquidity"
          txHash={addLiquidityTxHash}
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

import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { usePool } from '../../PoolProvider'
import { useRecoveryModeStep } from './useRecoveryModeStep'
import {
  TransactionStepsResponse,
  useTransactionSteps,
} from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useRecoveryModeChangedReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { Pool, ProtocolVersion } from '../../pool.types'
import { TransactionHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ActionFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { usePoolRedirect } from '../../pool.hooks'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { zeroAddress } from 'viem'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { ArrowUpRight } from 'react-feather'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'

export function RecoveryMode() {
  const { isDesktop } = useBreakpoints()
  const { userAddress } = useUserAccount()
  const { pool, isLoading: isPoolLoading, chain } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const enableRecoveryModeStep = useRecoveryModeStep()

  const isLoading = isPoolLoading
  const transactionSteps = useTransactionSteps([enableRecoveryModeStep], isLoading)
  const txHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  const receiptProps = useRecoveryModeChangedReceipt({
    chain,
    txHash,
    userAddress,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
    txReceipt: transactionSteps.lastTransaction?.result,
  })

  const isSuccess = !!txHash && !!receiptProps.data && receiptProps.enabled

  return (
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      {isDesktop && (
        <DesktopStepTracker
          chain={pool.chain}
          extraStyles={{ position: 'relative', top: '115px', left: '600px' }}
          isTxBatch={false}
          transactionSteps={transactionSteps}
        />
      )}

      <Card width="xl">
        <CardHeader>
          <TransactionHeader
            chain={pool.chain}
            isReceiptLoading={receiptProps.isLoading}
            label="Enable recovery mode"
            txHash={txHash}
          />
        </CardHeader>

        <CardBody>
          <RecoveryModeBody isMobile={!isDesktop} pool={pool} transactionSteps={transactionSteps} />
        </CardBody>

        <CardFooter>
          <ActionFooter
            currentStep={transactionSteps.currentStep}
            isSuccess={isSuccess}
            returnAction={redirectToPoolPage}
            returnLabel="Return to pool"
          />
        </CardFooter>
      </Card>
    </Box>
  )
}

type BodyProps = {
  isMobile: boolean
  pool: Pool
  transactionSteps: TransactionStepsResponse
}

function RecoveryModeBody({ isMobile, pool, transactionSteps }: BodyProps) {
  const pausedBy =
    pool.pauseManager === zeroAddress || !pool.pauseManager ? (
      <Text fontWeight="bold">Balancer Governance</Text>
    ) : (
      <Link href={getBlockExplorerAddressUrl(pool.pauseManager, pool.chain)} isExternal>
        <HStack gap="xss">
          <Text color="link">{abbreviateAddress(pool.pauseManager)}</Text>
          <ArrowUpRight size="12" />
        </HStack>
      </Link>
    )

  return (
    <AnimateHeightChange spacing="ms">
      {isMobile && <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />}

      <VStack p="ms">
        <HStack w="full">
          <Text fontWeight="bold">{`This Balancer v3 pool has been paused by`}</Text>
          {pausedBy}
        </HStack>
        <Text color="font.secondary">
          Pool pausing in Balancer is a critical emergency mechanism designed to protect user funds
          during security incidents, external protocol issues or vulnerabilities. Pausing a pool is
          typically a temporary first step to assess the situation before unpausing or enabling
          recovery mode.
        </Text>

        <Text fontWeight="bold" w="full">
          About recovery mode
        </Text>
        <Text color="font.secondary">
          After a pool is paused, recovery mode can be enabled by anyone in Balancer v3. This
          guarantees user funds cannot be permanently locked by governance. In recovery mode, only
          proportional withdrawals are allowed, enabling simple, safe exits.
        </Text>

        <Text fontWeight="bold" w="full">
          Enabling recovery mode is permissionless
        </Text>
        <Text color="font.secondary">
          Recovery mode can be enabled by anyone after a pool is paused. You can activate it or wait
          for another user.
        </Text>
      </VStack>
    </AnimateHeightChange>
  )
}

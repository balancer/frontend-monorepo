import { AlertProps, HStack } from '@chakra-ui/react'
import { useBreakpoints } from '../../hooks/useBreakpoints'
import { BalAlert } from './BalAlert'
import { BalAlertContent } from './BalAlertContent'
import { StepType, TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useStepWithTxBatch } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.hooks'

type Props = AlertProps & { steps: TransactionStep[] }

export function TxBatchAlert({ steps, ...alertProps }: Props) {
  const { isMobile } = useBreakpoints()
  const lastStep = steps[steps.length - 1]!
  const { isStepWithTxBatch } = useStepWithTxBatch(lastStep)

  if (isStepWithTxBatch && !isMobile) {
    return (
      <BalAlert content={<Content stepType={lastStep.stepType} />} status="info" {...alertProps} />
    )
  }

  return null
}

type ContentProps = {
  stepType: StepType
}

// Claim-type batches bundle contract permissions (relayer/minter approvals), not
// ERC-20 token allowances, so the copy must not mention "token approvals"
const NON_TOKEN_APPROVAL_STEP_TYPES: StepType[] = ['claim', 'claimAndUnstake']

function Content({ stepType }: ContentProps) {
  const operationName =
    stepType === 'addLiquidity'
      ? 'add liquidity'
      : stepType === 'removeLiquidity'
        ? 'remove liquidity'
        : stepType === 'stakingDeposit'
          ? 'stake'
          : stepType === 'claimAndUnstake'
            ? 'claim and unstake'
            : stepType === 'claim'
              ? 'claim'
              : 'swap'

  const approvalsPhrase = NON_TOKEN_APPROVAL_STEP_TYPES.includes(stepType)
    ? 'the required approvals'
    : 'token approvals'

  const description = `For a better experience, ${approvalsPhrase} and the ${operationName} operation will be bundled into a single transaction.`

  const title = NON_TOKEN_APPROVAL_STEP_TYPES.includes(stepType)
    ? 'Transaction bundling'
    : 'Token approval bundling'

  return (
    <HStack flexWrap={{ base: 'wrap', md: 'nowrap' }}>
      <BalAlertContent description={description} forceColumnMode title={title} wrapText />
    </HStack>
  )
}

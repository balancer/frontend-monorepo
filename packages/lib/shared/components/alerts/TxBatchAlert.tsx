 
import { AlertProps, HStack } from '@chakra-ui/react'
import { useBreakpoints } from '../../hooks/useBreakpoints'
import { BalAlert } from './BalAlert'
import { BalAlertContent } from './BalAlertContent'
import { StepType, TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useStepWithTxBatch } from '@repo/lib/modules/web3/safe.hooks'

type Props = AlertProps & { steps: TransactionStep[] }
export function TxBatchAlert({ steps, ...alertProps }: Props) {
  const { isMobile } = useBreakpoints()
  const lastStep = steps[steps.length - 1]
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
function Content({ stepType }: ContentProps) {
  const operationName = stepType === 'addLiquidity' ? 'add liquidity' : 'remove liquidity'
  const description = `For a better experience, token approvals and ${operationName} operation will be bundled into a single transaction.`
  return (
    <HStack flexWrap={{ base: 'wrap', md: 'nowrap' }}>
      <BalAlertContent
        description={description}
        forceColumnMode
        title="Token approval bundling in Safe App"
      />
    </HStack>
  )
}

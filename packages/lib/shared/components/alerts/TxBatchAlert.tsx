/* eslint-disable max-len */
import { AlertProps, HStack } from '@chakra-ui/react'
import { useBreakpoints } from '../../hooks/useBreakpoints'
import { BalAlert } from './BalAlert'
import { BalAlertContent } from './BalAlertContent'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useStepWithTxBatch } from '@repo/lib/modules/web3/safe.hooks'

type Props = AlertProps & { currentStep: TransactionStep }
export function TxBatchAlert({ currentStep, ...alertProps }: Props) {
  const { isMobile } = useBreakpoints()
  const { isStepWithTxBatch } = useStepWithTxBatch(currentStep)
  if (isStepWithTxBatch && !isMobile) {
    return <BalAlert content={<Content />} status="info" {...alertProps} />
  }
  return null
}

function Content() {
  return (
    <HStack flexWrap={{ base: 'wrap', md: 'nowrap' }}>
      <BalAlertContent
        description="For a better experience, token approvals and add liquidity operation will be bundled into a single transaction."
        forceColumnMode
        title="Token approval bundling in Safe App"
      />
    </HStack>
  )
}

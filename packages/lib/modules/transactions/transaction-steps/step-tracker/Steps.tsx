import { VStack } from '@chakra-ui/react'
import { Step } from './Step'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { TransactionStepsResponse } from '../useTransactionSteps'

type Props = {
  transactionSteps: TransactionStepsResponse
  isTxBatch?: boolean
}

export function Steps({ transactionSteps, isTxBatch }: Props) {
  const { steps, currentStepIndex, isLastStep } = transactionSteps
  const colorMode = useThemeColorMode()

  return (
    <VStack align="start" spacing="ms">
      {steps &&
        steps.map((step, index) => (
           
          <div key={step.id + index}>
            <Step
              colorMode={colorMode}
              currentIndex={currentStepIndex}
              index={index}
              isLastStep={isLastStep(index)}
              isTxBatch={isTxBatch}
              step={step}
            />
          </div>
        ))}
    </VStack>
  )
}

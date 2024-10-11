import { VStack } from '@chakra-ui/react'
import { Step } from './Step'
import { useThemeColorMode } from '@/lib/shared/services/chakra/useThemeColorMode'
import { TransactionStepsResponse } from '../useTransactionSteps'

type Props = {
  transactionSteps: TransactionStepsResponse
}

export function Steps({ transactionSteps }: Props) {
  const { steps, currentStepIndex, isLastStep } = transactionSteps
  const colorMode = useThemeColorMode()

  return (
    <VStack align="start" spacing="ms">
      {steps &&
        steps.map((step, index) => (
          <div key={step.id + index}>
            <Step
              currentIndex={currentStepIndex}
              index={index}
              step={step}
              colorMode={colorMode}
              isLastStep={isLastStep(index)}
            />
          </div>
        ))}
    </VStack>
  )
}

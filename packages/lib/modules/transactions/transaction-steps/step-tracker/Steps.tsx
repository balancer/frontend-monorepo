import { VStack } from '@chakra-ui/react'
import { Step } from './Step'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
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
          // eslint-disable-next-line react/no-array-index-key
          <div key={step.id + index}>
            <Step
              colorMode={colorMode}
              currentIndex={currentStepIndex}
              index={index}
              isLastStep={isLastStep(index)}
              step={step}
            />
          </div>
        ))}
    </VStack>
  )
}

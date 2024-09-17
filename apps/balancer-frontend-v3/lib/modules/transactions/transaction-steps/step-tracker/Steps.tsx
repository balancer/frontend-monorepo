import { Box, VStack } from '@chakra-ui/react'
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
    <VStack align="start" spacing="xs">
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
            {!isLastStep(index) && (
              <Box h="4" w="1" rounded="full" background="border.base" ml="3" mt="1" />
            )}
          </div>
        ))}
    </VStack>
  )
}

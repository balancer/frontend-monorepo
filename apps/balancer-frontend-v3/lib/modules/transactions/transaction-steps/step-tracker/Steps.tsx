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
      {steps
        ? steps.map((step, index) => (
            <div key={step.id + index}>
              <Step
                colorMode={colorMode}
                currentIndex={currentStepIndex}
                index={index}
                isLastStep={isLastStep(index)}
                step={step}
              />
              {!isLastStep(index) && (
                <Box background="border.base" h="4" ml="3" mt="1" rounded="full" w="1" />
              )}
            </div>
          ))
        : null}
    </VStack>
  )
}

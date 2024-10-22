'use client'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Text,
} from '@chakra-ui/react'

import { StepIndicator } from './Step'
import { Steps } from './Steps'
import { GasPriceCard } from '@repo/lib/shared/hooks/useGasPrice'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { TransactionStepsResponse } from '../useTransactionSteps'

type Props = {
  chain: GqlChain
  transactionSteps: TransactionStepsResponse
}

export function MobileStepTracker({ chain, transactionSteps }: Props) {
  const { steps, currentStepIndex, currentStep, currentTransaction, isLastStep } = transactionSteps
  const colorMode = useThemeColorMode()

  const totalSteps = steps?.length || 1

  const currentStepNumber = Math.min(currentStepIndex + 1, totalSteps)

  const stepLabel = `Step ${currentStepNumber}/${totalSteps}`

  return (
    <Accordion allowToggle textAlign="left" variant="button" width="full">
      <AccordionItem>
        {({ isExpanded }) => (
          <>
            <AccordionButton>
              <HStack fontSize="md" justify="flex-start" width="full">
                {currentStep && (
                  <StepIndicator
                    colorMode={colorMode}
                    currentIndex={currentStepIndex}
                    index={currentStepIndex}
                    isLastStep={isLastStep(currentStepIndex)}
                    step={currentStep}
                    transaction={currentTransaction}
                  />
                )}
                <Text>{currentStep?.labels.title}</Text>
              </HStack>
              <HStack fontSize="sm" justify="flex-end">
                {isExpanded && <GasPriceCard chain={chain} />}
                <Text color={isExpanded ? 'font.link' : 'font.highlight'} whiteSpace="nowrap">
                  {stepLabel}
                </Text>
                <AccordionIcon textColor={isExpanded ? 'font.link' : 'font.highlight'} />
              </HStack>
            </AccordionButton>
            <AccordionPanel pt="md">
              <Steps transactionSteps={transactionSteps} />
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  )
}

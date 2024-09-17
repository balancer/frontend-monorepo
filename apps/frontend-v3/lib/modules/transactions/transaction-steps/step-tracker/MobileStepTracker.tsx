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
import { GasPriceCard } from '@/lib/shared/hooks/useGasPrice'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { useThemeColorMode } from '@/lib/shared/services/chakra/useThemeColorMode'
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
    <Accordion width="full" variant="button" allowToggle textAlign="left">
      <AccordionItem>
        {({ isExpanded }) => (
          <>
            <AccordionButton>
              <HStack width="full" justify="flex-start" fontSize="md">
                {currentStep && (
                  <StepIndicator
                    transaction={currentTransaction}
                    currentIndex={currentStepIndex}
                    index={currentStepIndex}
                    step={currentStep}
                    colorMode={colorMode}
                    isLastStep={isLastStep(currentStepIndex)}
                  />
                )}
                <Text>{currentStep?.labels.title}</Text>
              </HStack>
              <HStack justify="flex-end" fontSize="sm">
                {isExpanded && <GasPriceCard chain={chain} />}
                <Text whiteSpace="nowrap" color={isExpanded ? 'font.link' : 'font.highlight'}>
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

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  HStack,
  Text,
  AccordionIcon,
} from '@chakra-ui/react'
import { ReactNode } from 'react'

interface VebalLockDetailsAccordionProps {
  accordionPanelComponent: ReactNode
  isDisabled?: boolean
}
export function VebalLockDetailsAccordion({
  accordionPanelComponent,
  isDisabled,
}: VebalLockDetailsAccordionProps) {
  return (
    <Box w="full">
      <Accordion allowToggle variant="button" w="full">
        <AccordionItem
          bg="background.level3"
          isDisabled={isDisabled}
          shadow={isDisabled ? 'none' : undefined}
          w="full"
        >
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <HStack>
                  <Text color="font.maxContrast" fontSize="sm">
                    veBAL details
                  </Text>
                </HStack>
              </Box>
              <AccordionIcon textColor="font.secondary" />
            </AccordionButton>
          </h2>
          <AccordionPanel py="md">{accordionPanelComponent}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
}

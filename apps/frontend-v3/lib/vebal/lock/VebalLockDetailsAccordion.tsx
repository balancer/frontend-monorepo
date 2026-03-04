import { Accordion, Box, HStack, Text } from '@chakra-ui/react';
import { ReactNode } from 'react'

interface VebalLockDetailsAccordionProps {
  accordionPanelComponent: ReactNode
  isDisabled?: boolean
}
export function VebalLockDetailsAccordion({
  accordionPanelComponent,
  isDisabled }: VebalLockDetailsAccordionProps) {
  return (
    <Box w="full">
      <Accordion.Root collapsible variant="button" w="full">
        <Accordion.Item
          bg="background.level3"
          disabled={isDisabled}
          shadow={isDisabled ? 'none' : undefined}
          w="full"
          value='item-0'>
          <h2>
            <Accordion.ItemTrigger>
              <Box as="span" flex="1" textAlign="left">
                <HStack>
                  <Text color="font.maxContrast" fontSize="sm">
                    veBAL details
                  </Text>
                </HStack>
              </Box>
              <Accordion.ItemIndicator textColor="font.secondary" />
            </Accordion.ItemTrigger>
          </h2>
          <Accordion.ItemContent py="md"><Accordion.ItemBody>{accordionPanelComponent}</Accordion.ItemBody></Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
}

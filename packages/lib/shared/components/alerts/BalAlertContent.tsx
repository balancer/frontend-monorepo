'use client'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import {
  Box,
  HStack,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Portal,
  Text,
} from '@chakra-ui/react'
import { PropsWithChildren, ReactNode } from 'react'

type AlertContentProps = {
  title?: string
  description?: ReactNode | string
  tooltipLabel?: string
  forceColumnMode?: boolean
}

// Utility component to display a title, description, optional tooltip and other nested components (buttons, links...) within an alert
export function BalAlertContent({
  title,
  description,
  tooltipLabel,
  // Set to true to always display the title and description in a column layout
  forceColumnMode = false,
  children,
}: PropsWithChildren<AlertContentProps>) {
  return (
    <HStack w="full" flexWrap="wrap" justifyContent="space-between">
      <HStack maxWidth={{ base: '100%', md: '80%' }} flexWrap="wrap">
        <Flex
          direction={forceColumnMode ? 'column' : { base: 'column', md: 'row' }}
          gap={forceColumnMode ? '0' : { base: '0', md: 'sm' }}
        >
          <HStack gap="xs">
            {title && (
              <Text fontWeight="bold" color="black" minWidth="max-content">
                {title}
              </Text>
            )}
            {tooltipLabel && (
              <Box position="relative" top="-1.5px" px="xxs">
                <Popover trigger="hover">
                  <PopoverTrigger>
                    <Box
                      opacity="0.8"
                      transition="opacity 0.2s var(--ease-out-cubic)"
                      _hover={{ opacity: 1 }}
                    >
                      <InfoOutlineIcon fontSize="sm" color="font.dark" />
                    </Box>
                  </PopoverTrigger>
                  <Portal>
                    <PopoverContent p="sm" w="auto" maxW="300px">
                      <Text fontSize="sm" variant="secondary">
                        {tooltipLabel}
                      </Text>
                    </PopoverContent>
                  </Portal>
                </Popover>
              </Box>
            )}
          </HStack>
          {description && (
            <Text color="black" lineHeight="1.45">
              {description}
            </Text>
          )}
        </Flex>
      </HStack>
      <Box>{children}</Box>
    </HStack>
  )
}

'use client'

import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Box, HStack, Flex, Tooltip, Text } from '@chakra-ui/react'
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
    <HStack flexWrap="wrap" justifyContent="space-between" w="full">
      <HStack flexWrap="wrap" maxWidth={{ base: '100%', md: '80%' }}>
        <Flex
          direction={forceColumnMode ? 'column' : { base: 'column', md: 'row' }}
          gap={forceColumnMode ? '0' : { base: '0', md: 'sm' }}
        >
          <HStack gap="xs">
            {title ? (
              <Text color="black" fontWeight="bold" minWidth="max-content">
                {title}
              </Text>
            ) : null}
            {tooltipLabel ? (
              <Box position="relative" pr="xs" top="-1.5px">
                <Tooltip label={tooltipLabel}>
                  <InfoOutlineIcon color="font.dark" fontSize="sm" />
                </Tooltip>
              </Box>
            ) : null}
          </HStack>
          {description ? (
            <Text color="black" lineHeight="1.45">
              {description}
            </Text>
          ) : null}
        </Flex>
      </HStack>
      <Box>{children}</Box>
    </HStack>
  )
}

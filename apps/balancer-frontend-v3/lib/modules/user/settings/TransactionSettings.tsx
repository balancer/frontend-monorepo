'use client'

import {
  Button,
  HStack,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  VStack,
  Text,
  ButtonProps,
} from '@chakra-ui/react'
import { useUserSettings } from './UserSettingsProvider'
import { fNum } from '@/lib/shared/utils/numbers'
import { Settings } from 'react-feather'
import { CurrencySelect } from './CurrencySelect'
import { SlippageInput } from './UserSettings'

export function TransactionSettings(props: ButtonProps) {
  const { slippage } = useUserSettings()

  return (
    <Popover placement="bottom-end" isLazy>
      <PopoverTrigger>
        <Button variant="tertiary" {...props}>
          <HStack textColor="grayText">
            <Text color="grayText" fontSize="xs">
              {fNum('slippage', slippage)}
            </Text>
            <Settings size={16} />
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow bg="background.level3" />
        <PopoverCloseButton />
        <PopoverHeader>
          <Heading size="md">Transaction settings</Heading>
        </PopoverHeader>
        <PopoverBody p="md">
          <VStack align="start" w="full" spacing="sm">
            <VStack align="start" w="full">
              <Heading size="sm">Slippage</Heading>
              <SlippageInput />
            </VStack>
            <VStack align="start" w="full">
              <Heading size="sm">Currency</Heading>
              <CurrencySelect id="transaction-settings-currency-select" />
            </VStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

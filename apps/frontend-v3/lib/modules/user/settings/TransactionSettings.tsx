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
  useDisclosure,
} from '@chakra-ui/react'
import { useUserSettings } from './UserSettingsProvider'
import { fNum } from '@/lib/shared/utils/numbers'
import { AlertTriangle, Settings } from 'react-feather'
import { CurrencySelect } from './CurrencySelect'
import { SlippageInput } from './UserSettings'

export function TransactionSettings(props: ButtonProps) {
  const { slippage, setSlippage } = useUserSettings()

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
              <SlippageInput slippage={slippage} setSlippage={setSlippage} />
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

interface ProportionalTransactionSettingsProps extends ButtonProps {
  slippage: string
  setSlippage: (value: string) => void
}

export function ProportionalTransactionSettings({
  slippage,
  setSlippage,
  ...props
}: ProportionalTransactionSettingsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Popover placement="bottom-end" isLazy isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <Button onClick={onOpen} variant="tertiary" {...props}>
          <HStack textColor="grayText">
            <AlertTriangle size={16} />
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
              <HStack>
                <Heading size="sm">Slippage</Heading>

                <Popover>
                  <PopoverTrigger>
                    <AlertTriangle size={16} />
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody>
                      <Text variant="secondary" fontSize="sm" lineHeight="18px" fontWeight="500">
                        Slippage is set to 0 by default for forced proportional actions to reduce
                        dust left over. If you need to set slippage higher than 0 it will
                        effectively lower the amount of tokens you can add in the form below. Then,
                        if slippage occurs, the transaction can take the amount of tokens you
                        specified + slippage from your token balance.
                      </Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </HStack>
              <SlippageInput slippage={slippage} setSlippage={setSlippage} />
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

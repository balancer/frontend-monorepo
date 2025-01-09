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
import { fNum } from '@repo/lib/shared/utils/numbers'
import { AlertTriangle, Settings } from 'react-feather'
import { CurrencySelect } from './CurrencySelect'
import { SlippageInput } from './UserSettings'
import { getDefaultProportionalSlippagePercentage } from '@repo/lib/shared/utils/slippage'
import { Pool } from '../../pool/PoolProvider'

export function TransactionSettings(props: ButtonProps) {
  const { slippage, setSlippage } = useUserSettings()

  return (
    <Popover isLazy placement="bottom-end">
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
          <VStack align="start" spacing="sm" w="full">
            <VStack align="start" w="full">
              <Heading size="sm">Slippage</Heading>
              <SlippageInput setSlippage={setSlippage} slippage={slippage} />
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
  pool: Pool
}

export function ProportionalTransactionSettings({
  slippage,
  setSlippage,
  pool,
  ...props
}: ProportionalTransactionSettingsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const defaultProportionalSlippagePercentage = getDefaultProportionalSlippagePercentage(pool)

  return (
    <Popover isLazy isOpen={isOpen} onClose={onClose} placement="bottom-end">
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
          <VStack align="start" spacing="sm" w="full">
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
                      <Text fontSize="sm" fontWeight="500" lineHeight="18px" variant="secondary">
                        Slippage is set to {defaultProportionalSlippagePercentage} by default for
                        forced proportional actions to reduce dust left over. If you need to set
                        slippage higher than {defaultProportionalSlippagePercentage} it will
                        effectively lower the amount of tokens you can add in the form below. Then,
                        if slippage occurs, the transaction can take the amount of tokens you
                        specified + slippage from your token balance.
                      </Text>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </HStack>
              <SlippageInput setSlippage={setSlippage} slippage={slippage} />
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

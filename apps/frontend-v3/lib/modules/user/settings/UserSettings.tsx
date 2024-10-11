'use client'

import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  VStack,
  Text,
  Switch,
} from '@chakra-ui/react'
import { useUserSettings } from './UserSettingsProvider'
import { blockInvalidNumberInput } from '@/lib/shared/utils/numbers'
import { Percent, Settings } from 'react-feather'
import { CurrencySelect } from './CurrencySelect'

interface SlippageInputProps {
  slippage: string
  setSlippage: (value: string) => void
}

export function SlippageInput({ slippage, setSlippage }: SlippageInputProps) {
  const presetOpts = ['0.5', '1', '2']

  return (
    <VStack align="start" w="full">
      <InputGroup>
        <Input
          value={slippage}
          type="number"
          bg="background.level1"
          autoComplete="off"
          autoCorrect="off"
          min={0}
          onChange={e => setSlippage(e.currentTarget.value)}
          onKeyDown={blockInvalidNumberInput}
        />
        <InputRightElement pointerEvents="none">
          <Percent color="grayText" size="20px" />
        </InputRightElement>
      </InputGroup>
      <HStack>
        {presetOpts.map(preset => (
          <Button
            key={preset}
            size="xs"
            variant={slippage === preset ? 'outline' : 'solid'}
            onClick={() => setSlippage(preset)}
          >
            <Text>{preset}%</Text>
          </Button>
        ))}
      </HStack>
    </VStack>
  )
}

function EnableSignaturesSelect() {
  const { enableSignatures, setEnableSignatures } = useUserSettings()

  const handleChange = () => {
    setEnableSignatures(enableSignatures === 'yes' ? 'no' : 'yes')
  }

  return <Switch isChecked={enableSignatures === 'yes'} onChange={handleChange} />
}

function ToggleAllowSounds() {
  const { allowSounds, setAllowSounds } = useUserSettings()

  const handleChange = () => {
    setAllowSounds(allowSounds === 'yes' ? 'no' : 'yes')
  }

  return <Switch isChecked={allowSounds === 'yes'} onChange={handleChange} />
}

export function UserSettings() {
  const { slippage, setSlippage } = useUserSettings()

  return (
    <Popover isLazy>
      <PopoverTrigger>
        <Button variant="tertiary" p="0">
          <Settings size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow bg="background.level3" />
        <PopoverCloseButton />
        <PopoverBody p="0">
          <HStack color="font.primary" p="md" pb="0">
            <Settings size={20} />
            <Heading size="md" variant="special">
              Settings
            </Heading>
          </HStack>
          <VStack align="start" spacing="lg" p="md">
            <Box w="full">
              <Heading size="sm" pb="2">
                Currency
              </Heading>
              <CurrencySelect id="user-settings-currency-select" />
            </Box>
            <Box w="full">
              <Heading size="sm" pb="2">
                Slippage
              </Heading>
              <SlippageInput slippage={slippage} setSlippage={setSlippage} />
            </Box>
            <Box w="full">
              <Heading size="sm" pb="xs">
                Use Signatures
              </Heading>
              <Text fontSize="sm" pb="sm" color="font.secondary">
                Signatures allow for gas-free transactions, where possible. If your wallet
                doesn&apos;t support signatures, you can turn it off.
              </Text>
              <EnableSignaturesSelect />
            </Box>
            <Box w="full">
              <Heading size="sm" pb="xs">
                Sound effects
              </Heading>
              <Text fontSize="sm" pb="sm" color="font.secondary">
                Allow sound effects for successful transactions. Disable if you prefer a silent
                experience.
              </Text>
              <ToggleAllowSounds />
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

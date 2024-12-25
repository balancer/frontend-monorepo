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
import { blockInvalidNumberInput } from '@repo/lib/shared/utils/numbers'
import { Percent, Settings } from 'react-feather'
import { CurrencySelect } from './CurrencySelect'

interface SlippageInputProps {
  slippage: string
  setSlippage: (value: string) => void
}

export function SlippageInput({ slippage, setSlippage }: SlippageInputProps) {
  const presetOpts = ['0.5', '1', '2']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    if (parseFloat(value) <= 50 || !value) {
      setSlippage(value)
    }
  }

  return (
    <VStack align="start" w="full">
      <InputGroup>
        <Input
          autoComplete="off"
          autoCorrect="off"
          bg="background.level1"
          // max={50}
          min={0}
          onChange={handleChange}
          onKeyDown={blockInvalidNumberInput}
          type="number"
          value={slippage}
        />
        <InputRightElement pointerEvents="none">
          <Percent color="grayText" size="20px" />
        </InputRightElement>
      </InputGroup>
      <HStack>
        {presetOpts.map(preset => (
          <Button
            key={preset}
            onClick={() => setSlippage(preset)}
            size="xs"
            variant={slippage === preset ? 'outline' : 'solid'}
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
        <Button p="0" variant="tertiary">
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
          <VStack align="start" p="md" spacing="lg">
            <Box w="full">
              <Heading pb="2" size="sm">
                Currency
              </Heading>
              <CurrencySelect id="user-settings-currency-select" />
            </Box>
            <Box w="full">
              <Heading pb="2" size="sm">
                Slippage
              </Heading>
              <SlippageInput setSlippage={setSlippage} slippage={slippage} />
            </Box>
            <Box w="full">
              <Heading pb="xs" size="sm">
                Use Signatures
              </Heading>
              <Text color="font.secondary" fontSize="sm" pb="sm">
                Signatures allow for gas-free transactions, where possible. If your wallet
                doesn&apos;t support signatures, you can turn it off.
              </Text>
              <EnableSignaturesSelect />
            </Box>
            <Box w="full">
              <Heading pb="xs" size="sm">
                Sound effects
              </Heading>
              <Text color="font.secondary" fontSize="sm" pb="sm">
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

'use client'

import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
  InputGroup,
  Popover,
  VStack,
  Text,
  Switch } from '@chakra-ui/react';
import { useUserSettings } from './UserSettingsProvider'
import { blockInvalidNumberInput } from '@repo/lib/shared/utils/numbers'
import { Percent, Settings } from 'react-feather'
import { CurrencySelect } from './CurrencySelect'
import { EnableTxBundleSetting } from './EnableTxBundlesSetting'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'

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
      <InputGroup endElement={<Percent color="grayText" size="20px" />} endElementProps={{ pointerEvents: 'none' }}>
        <Input
          _hover={{
            bg: 'input.bgHover',
            borderColor: 'input.borderHover' }}
          autoComplete="off"
          autoCorrect="off"
          bg="background.level1"
          // max={50}
          min={0}
          onValueChange={handleChange}
          onKeyDown={blockInvalidNumberInput}
          type="number"
          value={String(slippage)}
        />
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
  );
}

export function EnableSignaturesSelect() {
  const { enableSignatures, setEnableSignatures } = useUserSettings()

  const handleChange = () => {
    setEnableSignatures(enableSignatures === 'yes' ? 'no' : 'yes')
  }

  return (
    <Switch.Root checked={enableSignatures === 'yes'} onCheckedChange={handleChange}>
      <Switch.HiddenInput />
      <Switch.Control><Switch.Thumb /></Switch.Control>
    </Switch.Root>
  );
}

function ToggleAllowSounds() {
  const { allowSounds, setAllowSounds } = useUserSettings()

  const handleChange = () => {
    setAllowSounds(allowSounds === 'yes' ? 'no' : 'yes')
  }

  return (
    <Switch.Root checked={allowSounds === 'yes'} onCheckedChange={handleChange}>
      <Switch.HiddenInput />
      <Switch.Control><Switch.Thumb /></Switch.Control>
    </Switch.Root>
  );
}

export function UserSettings() {
  const { slippage, setSlippage } = useUserSettings()

  const handleSettingsClick = () => {
    trackEvent(AnalyticsEvent.ClickNavUtilitiesSettings)
  }

  return (
    <Popover.Root lazyMount>
      <Popover.Trigger asChild>
        <Button onClick={handleSettingsClick} p="0" variant="tertiary">
          <Settings size={18} />
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow bg="background.level3" />
          <Popover.CloseTrigger />
          <Popover.Body p="0">
            <HStack color="font.primary" p="md" pb="0">
              <Settings size={20} />
              <Heading size="md" variant="special">
                Settings
              </Heading>
            </HStack>
            <VStack align="start" p="md" gap="lg">
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
              <EnableTxBundleSetting />
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

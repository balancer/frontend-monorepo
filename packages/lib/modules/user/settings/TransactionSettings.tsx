import { Button, HStack, Heading, Popover, VStack, Text, ButtonProps, Box } from '@chakra-ui/react'
import { useUserSettings } from './UserSettingsProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { Settings } from 'react-feather'
import { CurrencySelect } from './CurrencySelect'
import { EnableSignaturesSelect, SlippageInput } from './UserSettings'
import { EnableTxBundleSetting } from './EnableTxBundlesSetting'

export function TransactionSettings(props: ButtonProps) {
  const { slippage, setSlippage } = useUserSettings()

  return (
    <Popover.Root
      lazyMount
      positioning={{
        placement: 'bottom-end',
      }}
    >
      <Popover.Trigger asChild>
        <Button variant="tertiary" {...props}>
          <HStack color="grayText" gap="6px">
            <Text color="grayText" fontSize="xs">
              {fNum('slippage', slippage)}
            </Text>
            <Settings size={14} />
          </HStack>
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow bg="background.level3" />
          <Popover.CloseTrigger />
          <Popover.Title>
            <Heading size="md">Transaction settings</Heading>
          </Popover.Title>
          <Popover.Body p="md">
            <VStack align="start" gap="lg" w="full">
              <VStack align="start" w="full">
                <Heading size="sm">Currency</Heading>
                <CurrencySelect id="transaction-settings-currency-select" />
              </VStack>
              <VStack align="start" w="full">
                <Heading size="sm">Slippage</Heading>
                <SlippageInput setSlippage={setSlippage} slippage={slippage} />
              </VStack>
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
              <EnableTxBundleSetting />
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}

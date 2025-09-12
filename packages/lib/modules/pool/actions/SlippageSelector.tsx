import { HStack, Text, TextDecorationProps, VStack } from '@chakra-ui/react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { useState } from 'react'

type Props = {
  title?: string
  description?: string
  onChange: (value: SlippageOptions) => void
  selectedIndex: number
}

export type SlippageOptions = 'zero' | 'max'

const OPTIONS: ButtonGroupOption[] = [
  { value: 'zero', label: '0%' },
  { value: 'max', label: 'Max' },
]

export const FLEXIBLE_ADD_DESCRIPTION = `
For Flexible adds, any slippage is deducted from the LP token to be received. Slippage
occurs when market conditions change between the time your transaction is submitted
and the time it gets executed on-chain (e.g. from front-running). Slippage tolerance is
the maximum change in price you are willing to accept. If your slippage tolerance is
too low, your transaction will likely fail.`

export const PROPORTIONAL_ADD_DESCRIPTION = `
For Proportional adds, a buffer is 'reserved' from the tokens added to allow slippage
up to your max amount. Slippage occurs when market conditions change between the time
your transaction is submitted and the time it gets executed on-chain (e.g. from
front-running). Slippage tolerance is the maximum change in price you are willing to
accept. If your slippage tolerance is too low, your transaction will likely fail.`

export const EXACT_IN_SWAP_DESCRIPTION = `
Since you entered the "You pay" token amount, any slippage is deducted from the "You'll
get" token before you receive it. Slippage occurs when market conditions change between
the time your transaction is submitted and the time it gets executed on-chain (e.g.
from front-running). Slippage tolerance is the maximum change in price you are willing
to accept. If your slippage tolerance is too low, your transaction will likely fail.`

export const EXACT_OUT_SWAP_DESCRIPTION = `
Since you entered the "You'll get" token amount, any slippage is deducted from the
"You pay" token to ensure you get exactly the amount that you entered. Slippage occurs
when market conditions change between the time your transaction is submitted and the
time it gets executed on-chain (e.g. from front-running). Slippage tolerance is the
maximum change in price you are willing to accept. If your slippage tolerance is too
low, your transaction will likely fail.`

export function SlippageSelector({ title, description, onChange, selectedIndex }: Props) {
  const [selected, setSelected] = useState(OPTIONS[selectedIndex])

  const textAttr = {
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationThickness: '1px',
  } as TextDecorationProps

  const selectOption = (option: ButtonGroupOption) => {
    setSelected(option)
    onChange(option.value as SlippageOptions)
  }

  return (
    <HStack>
      <TooltipWithTouch
        isDisabled={!description}
        label={
          <VStack>
            <Text color="black" fontWeight="bold">
              {title}
            </Text>
            <Text color="black">{description}</Text>
          </VStack>
        }
      >
        <Text fontSize="xs" fontWeight="semibold" variant="secondary" {...textAttr}>
          If slippage:
        </Text>
      </TooltipWithTouch>

      <ButtonGroup
        currentOption={selected}
        groupId="slippage"
        onChange={selectOption}
        options={OPTIONS}
        size="xs"
      />
    </HStack>
  )
}

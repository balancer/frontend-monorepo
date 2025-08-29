import { HStack, Text, TextDecorationProps } from '@chakra-ui/react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { useState } from 'react'

type Props = {
  description?: string
  onChange: (value: SlippageOptions) => void
  selectedIndex: number
}

export type SlippageOptions = 'zero' | 'max'

const OPTIONS: ButtonGroupOption[] = [
  { value: 'zero', label: '0%' },
  { value: 'max', label: 'Max' },
]

export const ADD_LIQUIDITY_DESCRIPTION = `
  For Flexible adds, any slippage is deducted from the LP token to be received.
  For proportional adds, a buffer is ‘reserved’ from the tokens added to allow
  slippage up to your max amount. Slippage occurs when market conditions change
  between the time your transaction is submitted and the time it gets executed
  on-chain. Slippage tolerance is the maximum change in price you are willing
  to accept.`

export function SlippageSelector({ description, onChange, selectedIndex }: Props) {
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
      <TooltipWithTouch isDisabled={!description} label={description}>
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

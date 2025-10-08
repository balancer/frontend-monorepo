import { Box, HStack, Text, VStack } from '@chakra-ui/react'
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

const slippageDescription =
  'Slippage occurs when market conditions change between the time your transaction is submitted and the time it gets executed on-chain (e.g. from front-running).'

const slippageTolerance =
  'Slippage tolerance is the maximum change in price you are willing to accept. If your slippage tolerance is too low, your transaction will likely fail.'

export const FLEXIBLE_ADD_DESCRIPTION = `For Flexible adds, any slippage is deducted from the LP token to be received. 

${slippageDescription} 

${slippageTolerance}`

export const PROPORTIONAL_ADD_DESCRIPTION = `For Proportional adds, a buffer is 'reserved' from the tokens added to allow slippage up to your max amount.

${slippageDescription} 

${slippageTolerance}`

export const EXACT_IN_SWAP_DESCRIPTION = `Since you entered the "You pay" token amount, any slippage is deducted from the "You'll get" token before you receive it. 

${slippageDescription} 

${slippageTolerance}`

export const EXACT_OUT_SWAP_DESCRIPTION = `Since you entered the "You'll get" token amount, any slippage is deducted from the "You pay" token to ensure you get exactly the amount that you entered. 

${slippageDescription} 

${slippageTolerance}`

export function SlippageSelector({ title, description, onChange, selectedIndex }: Props) {
  const [selected, setSelected] = useState(OPTIONS[selectedIndex])

  const selectOption = (option: ButtonGroupOption) => {
    setSelected(option)
    onChange(option.value as SlippageOptions)
  }

  return (
    <HStack>
      <TooltipWithTouch
        isDisabled={!description}
        label={
          <VStack alignItems="start">
            <Text color="font.primary" fontSize="sm" fontWeight="bold" pb="xs">
              {title}
            </Text>
            <Text color="font.secondary" fontSize="sm" whiteSpace="pre-line">
              {description}
            </Text>
          </VStack>
        }
        p="ms"
      >
        <Box
          as="span"
          cursor="default"
          display="inline-block"
          position="relative"
          sx={{
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '0px',
              borderBottom: '1px dotted',
              borderColor: 'font.secondary',
              opacity: 0.5,
            },
          }}
          top="-3px"
        >
          <Text as="span" fontSize="xs" variant="secondary">
            Simulated slippage:
          </Text>
        </Box>
      </TooltipWithTouch>

      <ButtonGroup
        currentOption={selected}
        fontSize="11px"
        groupId="slippage"
        isCompact
        onChange={selectOption}
        options={OPTIONS}
        size="xxxs"
      />
    </HStack>
  )
}

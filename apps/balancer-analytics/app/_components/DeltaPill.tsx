'use client'

import { HStack, Icon } from '@chakra-ui/react'
import { ArrowDown, ArrowUp } from 'react-feather'

type Props = {
  value: number // 0.0124 means +1.24%
  currency?: boolean // format absolute as $ instead of %
}

const usdAbs = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)

/**
 * Compact up/down delta chip. Up = green, down = warm red. Built on plain
 * `HStack` rather than Chakra's `Tag` because Tag's `subtle` variant in dark
 * mode produced a low-contrast washed-out pill — the arrow and digits both
 * read at a glance now.
 */
export function DeltaPill({ value, currency = false }: Props) {
  if (value == null || !Number.isFinite(value)) return null
  const pos = value > 0
  const neg = value < 0

  // Dark base from the color scale for the pill background, bright tone for
  // the text+arrow so they pop against the dark background.
  const bg = pos ? 'green.900' : neg ? 'red.900' : 'background.level3'
  const fg = pos ? 'green.300' : neg ? 'red.300' : 'font.tertiary'
  const ArrowIcon = pos ? ArrowUp : neg ? ArrowDown : null

  const text = currency
    ? usdAbs(Math.abs(value))
    : `${(Math.abs(value) * 100).toFixed(2)}%`

  return (
    <HStack
      bg={bg}
      borderRadius="full"
      color={fg}
      fontFamily="mono"
      fontSize="xs"
      fontWeight="bold"
      lineHeight={1}
      px="2"
      py="1"
      spacing="1"
    >
      {ArrowIcon ? <Icon as={ArrowIcon} boxSize="10px" strokeWidth={3} /> : null}
      <span>{text}</span>
    </HStack>
  )
}

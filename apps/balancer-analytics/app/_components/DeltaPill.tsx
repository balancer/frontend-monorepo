'use client'

import { Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'

type Props = {
  value: number       // 0.0124 means +1.24%
  currency?: boolean  // format absolute as $ instead of %
}

export function DeltaPill({ value, currency = false }: Props) {
  if (value == null || !Number.isFinite(value)) return null
  const pos = value > 0
  const neg = value < 0
  const colorScheme = pos ? 'green' : neg ? 'red' : 'gray'
  const text = currency
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(Math.abs(value))
    : `${(Math.abs(value) * 100).toFixed(2)}%`
  return (
    <Tag colorScheme={colorScheme} fontFamily="mono" fontSize="xs" size="sm" variant="subtle">
      {pos && <TagLeftIcon as={TriangleUpIcon} boxSize="2.5" />}
      {neg && <TagLeftIcon as={TriangleDownIcon} boxSize="2.5" />}
      <TagLabel>{text}</TagLabel>
    </Tag>
  )
}

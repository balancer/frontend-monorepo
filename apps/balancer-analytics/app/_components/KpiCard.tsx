'use client'

import { Box, Card, Flex, Skeleton, Text } from '@chakra-ui/react'
import { Sparkline } from './Sparkline'
import { DeltaPill } from './DeltaPill'

type Props = {
  label: string
  value: string
  sub?: string
  delta?: number | null
  spark?: number[]
  sparkColor?: string
  accent?: string
  big?: boolean
  isLoading?: boolean
}

export function KpiCard({
  label,
  value,
  sub,
  delta,
  spark,
  sparkColor = 'green.400',
  accent,
  big,
  isLoading,
}: Props) {
  return (
    <Card overflow="hidden" position="relative" variant="level1">
      {accent && (
        <Box
          bg={accent}
          bottom={0}
          left={0}
          opacity={0.7}
          position="absolute"
          top={0}
          width="2px"
        />
      )}
      <Flex align="center" justify="space-between" mb="xs">
        <Text fontSize="xs" textTransform="uppercase" variant="eyebrow">
          {label}
        </Text>
        {delta != null && <DeltaPill value={delta} />}
      </Flex>
      <Flex align="baseline" gap="ms" justify="space-between">
        {isLoading ? (
          <Skeleton h={big ? '8' : '7'} w="60%" />
        ) : (
          <Text
            as="span"
            color="font.maxContrast"
            fontSize={big ? '3xl' : '2xl'}
            fontWeight="bold"
            letterSpacing="-0.6px"
            lineHeight="1.05"
          >
            {value}
          </Text>
        )}
        {spark && (
          <Sparkline
            height={big ? 38 : 28}
            stroke={sparkColor}
            values={spark}
            width={big ? 100 : 80}
          />
        )}
      </Flex>
      {sub && (
        <Text color="font.secondary" fontSize="xs" mt="xs">
          {sub}
        </Text>
      )}
    </Card>
  )
}

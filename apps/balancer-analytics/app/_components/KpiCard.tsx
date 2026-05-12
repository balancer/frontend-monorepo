'use client'

import { Card, Flex, Skeleton, Text, VStack } from '@chakra-ui/react'
import { Sparkline } from './Sparkline'
import { DeltaPill } from './DeltaPill'

type Props = {
  label: string
  value: string
  sub?: string
  delta?: number | null
  spark?: number[]
  sparkColor?: string
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
  big,
  isLoading,
}: Props) {
  return (
    <Card h="full" p={{ base: 'md', md: big ? 'lg' : 'md' }} variant="level2">
      <VStack align="stretch" h="full" justify="space-between" spacing="md">
        <Flex align="center" gap="sm" justify="space-between">
          <Text
            color="font.secondary"
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="0.4px"
            textTransform="uppercase"
          >
            {label}
          </Text>
          {delta != null && <DeltaPill value={delta} />}
        </Flex>

        <Flex align="baseline" gap="ms" justify="space-between">
          {isLoading ? (
            <Skeleton h={big ? '10' : '8'} w="60%" />
          ) : (
            <Text
              as="span"
              className="home-stats"
              color="font.maxContrast"
              fontSize={big ? '4xl' : '2xl'}
              fontWeight="bold"
              letterSpacing="-0.8px"
              lineHeight="1.05"
            >
              {value}
            </Text>
          )}
          {spark && (
            <Sparkline
              height={big ? 42 : 30}
              stroke={sparkColor}
              values={spark}
              width={big ? 110 : 80}
            />
          )}
        </Flex>

        {sub && (
          <Text color="font.secondary" fontSize="xs">
            {sub}
          </Text>
        )}
      </VStack>
    </Card>
  )
}

'use client'

import { Box, Card, Flex, Skeleton, Text, VStack } from '@chakra-ui/react'
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
  /** Apply the monorepo slate texture as a card backdrop. Pulled from
   *  apps/frontend-v3/public/images/textures/slate-square-small-dark.jpg.
   *  Off by default so existing call sites (pool detail snapshots) stay
   *  visually unchanged. */
  textured?: boolean
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
  textured,
}: Props) {
  return (
    <Card
      h="full"
      overflow="hidden"
      p={{ base: 'md', md: big ? 'lg' : 'md' }}
      position="relative"
      variant="level2"
    >
      {textured ? (
        <Box
          aria-hidden
          backgroundImage="url('/images/textures/slate-square-small-dark.jpg')"
          backgroundPosition="center"
          backgroundSize="cover"
          inset={0}
          opacity={0.35}
          pointerEvents="none"
          position="absolute"
        />
      ) : null}
      <VStack align="stretch" h="full" justify="space-between" position="relative" spacing="md">
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

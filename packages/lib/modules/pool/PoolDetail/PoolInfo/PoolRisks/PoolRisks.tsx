'use client'

import {
  Box,
  Card,
  CardRootProps,
  Heading,
  Text,
  TextProps,
  VStack,
  Link,
  Separator,
  List,
} from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { getPoolRisks, risksTitle } from './usePoolRisks'
import NextLink from 'next/link'

interface RisksListProps {
  textVariant?: TextProps['variant']
}

export function RisksList({ textVariant = 'secondary' }: RisksListProps) {
  const { pool } = usePool()
  const riskGroups = getPoolRisks(pool as GqlPoolElement)

  return (
    <VStack alignItems="flex-start" gap="xs">
      <Text variant={textVariant}>{risksTitle()}</Text>
      <Box>
        {riskGroups.map(group => (
          <Box key={group.category}>
            <Text fontWeight="bold" mt="sm">
              {group.title}
            </Text>
            <List.Root as="ul" ml="6" variant="link">
              {group.risks.map(risk => (
                <List.Item key={`pool-risk-${risk.path.replaceAll('//', '')}`}>
                  <Link asChild>
                    <NextLink href={risk.path}>{risk.title}</NextLink>
                  </Link>
                </List.Item>
              ))}
            </List.Root>
          </Box>
        ))}
      </Box>
    </VStack>
  )
}

export function PoolRisks({ ...props }: CardRootProps) {
  return (
    <Card.Root {...props}>
      <VStack alignItems="flex-start" gap="4" width="full">
        <Heading fontSize="1.25rem" size="h4">
          Pool risks
        </Heading>
        <Separator />
        <RisksList />
      </VStack>
    </Card.Root>
  )
}

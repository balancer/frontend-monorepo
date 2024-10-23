'use client'

import {
  Card,
  CardProps,
  Divider,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { getPoolRisks, risksTitle } from './usePoolRisks'

interface RisksListProps {
  textVariant?: string
}

export function RisksList({ textVariant = 'secondary' }: RisksListProps) {
  const { pool } = usePool()
  const risks = getPoolRisks(pool as GqlPoolElement)
  return (
    <VStack alignItems="flex-start">
      <Text variant={textVariant}>{risksTitle()}</Text>
      <UnorderedList ml="6">
        {risks.map(risk => (
          <Link
            href={risk.path}
            key={`pool-risk-${risk.path.replaceAll('//', '')}`}
            target="_blank"
          >
            <ListItem>{risk.title}</ListItem>
          </Link>
        ))}
      </UnorderedList>
    </VStack>
  )
}

export function PoolRisks({ ...props }: CardProps) {
  return (
    <Card {...props}>
      <VStack alignItems="flex-start" spacing="4" width="full">
        <Heading fontSize="1.25rem" variant="h4">
          Pool risks
        </Heading>
        <Divider />
        <RisksList />
      </VStack>
    </Card>
  )
}

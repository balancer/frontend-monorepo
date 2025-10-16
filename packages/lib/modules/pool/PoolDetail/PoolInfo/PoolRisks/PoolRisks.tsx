'use client'

import {
  Box,
  Card,
  CardProps,
  Divider,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  VStack,
  Link,
} from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { getPoolRisks, risksTitle } from './usePoolRisks'

interface RisksListProps {
  textVariant?: string
}

export function RisksList({ textVariant = 'secondary' }: RisksListProps) {
  const { pool } = usePool()
  const riskGroups = getPoolRisks(pool as GqlPoolElement)

  return (
    <VStack alignItems="flex-start" gap="xs">
      <Text variant={textVariant}>{risksTitle()}</Text>
      <Box ml="0">
        {riskGroups.map(group => (
          <Box key={group.category}>
            <Text fontWeight="bold" mt="sm">
              {group.title}
            </Text>
            <UnorderedList ml="6">
              {group.risks.map(risk => (
                <Link
                  href={risk.path}
                  isExternal
                  key={`pool-risk-${risk.path.replaceAll('//', '')}`}
                >
                  <ListItem color="link">{risk.title}</ListItem>
                </Link>
              ))}
            </UnorderedList>
          </Box>
        ))}
      </Box>
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

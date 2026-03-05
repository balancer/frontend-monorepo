import { Box, Card, Stack, Heading, Text, VStack, HStack, Link, Separator } from '@chakra-ui/react';
import { useFormattedPoolAttributes } from './useFormattedPoolAttributes'
import { ArrowUpRight } from 'react-feather'
import { isGyroEPool, isV3LBP } from '../../../pool.helpers'
import { usePool } from '../../../PoolProvider'
import { LbpPoolAttributes } from './LbpPoolAttributes'
import { LbpPoolChartsProvider } from '../../../LbpDetail/LbpPoolCharts/LbpPoolChartsProvider'
import { ClpPoolAttributes } from './ClpPoolAttributes'

export function PoolAttributes() {
  const { pool } = usePool()
  const formattedAttributes = useFormattedPoolAttributes()

  return (
    <Card.Root>
      <VStack alignItems="flex-start" gap={{ base: 'sm', md: 'md' }} width="full">
        <Heading fontSize="1.25rem" variant="h4">
          Pool attributes
        </Heading>
        <Separator />
        <VStack width="full">
          {formattedAttributes.map(attribute => {
            return (
              <Stack
                direction={{ base: 'column', md: 'row' }}
                key={`pool-attribute-${attribute.title}`}
                gap={{ base: 'xxs', md: 'xl' }}
                width="full"
              >
                <Box minWidth="160px">
                  <Text variant="secondary">{attribute.title}:</Text>
                </Box>
                {attribute.link ? (
                  <Link
                    href={attribute.link}
                    variant="link"
                    target='_blank'
                    rel='noopener noreferrer'>
                    <HStack gap="xxs">
                      <Text color="link">{attribute.value}</Text>
                      <ArrowUpRight size={12} />
                    </HStack>
                  </Link>
                ) : (
                  <Text mb={{ base: 'sm', md: '0' }} variant="secondary">
                    {attribute.value}
                  </Text>
                )}
              </Stack>
            );
          })}
        </VStack>

        {isV3LBP(pool) && (
          <LbpPoolChartsProvider>
            <LbpPoolAttributes pool={pool} />
          </LbpPoolChartsProvider>
        )}

        {isGyroEPool(pool) && <ClpPoolAttributes pool={pool} />}
      </VStack>
    </Card.Root>
  );
}

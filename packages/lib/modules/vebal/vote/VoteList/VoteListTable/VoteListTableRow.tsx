import { Box, Button, Grid, GridItem, GridProps, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { VoteListItem } from '@repo/lib/modules/vebal/vote/vote.types'
import { PoolListTokenPills } from '@repo/lib/modules/pool/PoolList/PoolListTokenPills'
import { getPoolPath, getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import { VoteRateTooltip } from '@repo/lib/modules/vebal/vote/VoteRateTooltip'
import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import { useState } from 'react'

interface Props extends GridProps {
  vote: VoteListItem
  keyValue: number
}

export function VoteListTableRow({ vote, keyValue, ...rest }: Props) {
  const { toCurrency } = useCurrency()

  const [selected, setSelected] = useState(false)

  const toggleSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelected(v => !v)
  }

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        px={{ base: '0', sm: 'md' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
          <GridItem>
            <NetworkIcon chain={vote.chain} size={6} />
          </GridItem>
          <GridItem>
            <Link
              href={getPoolPath({
                id: vote.id,
                chain: vote.chain,
                type: vote.type,
                protocolVersion: undefined,
              })}
              target="_blank"
            >
              <HStack>
                <PoolListTokenPills
                  chain={vote.chain}
                  displayTokens={vote.tokens}
                  h={['32px', '36px']}
                  iconSize={20}
                  p={['xxs', 'sm']}
                  pr={[1.5, 'ms']}
                  type={vote.type}
                />
                <Box color="font.secondary">
                  <ArrowUpIcon transform="rotate(90)" />
                </Box>
              </HStack>
            </Link>
          </GridItem>
          <GridItem textAlign="right">
            <Text fontWeight="medium" textAlign="right" textTransform="capitalize">
              {getPoolTypeLabel(vote.type)}
            </Text>
          </GridItem>
          <GridItem textAlign="right">
            <Text fontWeight="medium" textAlign="right">
              {/* fix: where is data? */}
              {toCurrency(0, { abbreviated: false })}
            </Text>
          </GridItem>
          <GridItem textAlign="right">
            <Text fontWeight="medium" textAlign="right">
              {/* fix: where is data? */}
              {toCurrency(0, { abbreviated: false })}
            </Text>
          </GridItem>
          <GridItem justifySelf="end" textAlign="right">
            <VoteRateTooltip vote={vote} />
          </GridItem>
          <GridItem justifySelf="end">
            <Button
              color={selected ? 'font.secondary' : undefined}
              fontSize="sm"
              fontWeight="700"
              onClick={toggleSelection}
              variant={selected ? 'outline' : 'secondary'}
              w="80px"
            >
              {selected ? 'Selected' : 'Select'}
            </Button>
          </GridItem>
        </Grid>
      </Box>
    </FadeInOnView>
  )
}

'use client'

import { Box, BoxProps, Card, Flex, Grid, GridItem, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { StsByTheNumbersSvg } from './StsByTheNumbersSvg'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { useGetStakedSonicData } from '../hooks/useGetStakedSonicData'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import networkConfigs from '@repo/lib/config/networks'
import { Address } from 'viem'

const CHAIN = GqlChain.Sonic

const COMMON_NOISY_CARD_PROPS: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 'none',
    borderTopLeftRadius: 'none',
    borderBottomRightRadius: 'none',
    rounded: 'lg',
    overflow: 'hidden',
  },
  cardProps: {
    position: 'relative',
    height: 'full',
    rounded: 'lg',
    overflow: 'hidden',
  },
}

function GlobalStatsCard({
  label,
  value,
  isLoading,
}: {
  label: string
  value: string
  isLoading: boolean
}) {
  return (
    <Flex alignItems="flex-end" mx="md" my="sm">
      <Box color="font.highlight" flex="1" fontWeight="semibold" textAlign="left">
        {label}
      </Box>
      <Box>
        {isLoading ? (
          <Skeleton color="white" h="40px" w="full" />
        ) : (
          <Text fontSize="4xl">{value}</Text>
        )}
      </Box>
    </Flex>
  )
}

export function LstStats() {
  const lstAddress = (networkConfigs[CHAIN].contracts.beets?.lstStakingProxy || '') as Address
  const { getToken, usdValueForToken } = useTokens()
  const lstToken = getToken(lstAddress, CHAIN)
  const { toCurrency } = useCurrency()
  const { data: stakedSonicData, loading: isStakedSonicDataLoading } = useGetStakedSonicData()
  const stakingApr = stakedSonicData?.stsGetGqlStakedSonicData.stakingApr || '0'
  const stakedSonic = stakedSonicData?.stsGetGqlStakedSonicData.totalAssets || '0'

  return (
    <Card rounded="xl" w="full">
      <NoisyCard
        cardProps={COMMON_NOISY_CARD_PROPS.cardProps}
        contentProps={COMMON_NOISY_CARD_PROPS.contentProps}
      >
        <Box bottom={0} left={0} overflow="hidden" position="absolute" right={0} top={0}>
          <ZenGarden sizePx="280px" subdued variant="circle" />
        </Box>
        <Box bg="rgba(0, 0, 0, 0.1)" display="flex" w="full">
          <Grid
            gap="sm"
            px="lg"
            py="lg"
            templateColumns={{
              base: '1fr',
              lg: '1fr',
              xl: '1.25fr 1fr 1fr 1fr',
            }}
            w="full"
          >
            <GridItem alignItems="center" display="flex">
              <StsByTheNumbersSvg />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard
                isLoading={isStakedSonicDataLoading}
                label="APR"
                value={fNum('apr', stakingApr)}
              />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard
                isLoading={isStakedSonicDataLoading}
                label="TVL"
                value={toCurrency(usdValueForToken(lstToken, stakedSonic))}
              />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard
                isLoading={isStakedSonicDataLoading}
                label="Total $S"
                value={fNum('token', stakedSonic)}
              />
            </GridItem>
          </Grid>
        </Box>
      </NoisyCard>
    </Card>
  )
}

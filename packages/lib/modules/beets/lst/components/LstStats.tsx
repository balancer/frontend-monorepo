'use client'

import { Box, Card, Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { StsByTheNumbersSvg } from './StsByTheNumbersSvg'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'

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

function GlobalStatsCard({ label, value }: { label: string; value: string }) {
  return (
    <Flex alignItems="flex-end" mx="md" my="sm">
      <Box color="font.highlight" flex="1" fontWeight="semibold" textAlign="left">
        {label}
      </Box>
      <Box>
        <Text fontSize="4xl">{value}</Text>
      </Box>
    </Flex>
  )
}

export function LstStats({}: {}) {
  const { toCurrency } = useCurrency()

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
              <GlobalStatsCard label="APR" value="16.8%" />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard label="TVL" value={toCurrency(1000000)} />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard label="$S STAKED" value="1.00m" />
            </GridItem>
          </Grid>
        </Box>
      </NoisyCard>
    </Card>
  )
}

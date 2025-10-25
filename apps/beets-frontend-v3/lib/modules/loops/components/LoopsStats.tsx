import { Box, BoxProps, Card, Flex, Grid, GridItem, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useLoopsGetData } from '../hooks/useLoopsGetData'
import { LoopsByTheNumbersSvg } from './LoopsByTheNumbersSvg'

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

export function LoopsStats() {
  const { toCurrency } = useCurrency()
  const { data: loopsData, loading: isLoopsDataLoading } = useLoopsGetData()

  const loopsApr = loopsData?.loopsGetData.apr || '0'
  const loopsTVL = loopsData?.loopsGetData.tvl || '0'
  const loopsNav = loopsData?.loopsGetData.nav || '0'

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
              <LoopsByTheNumbersSvg />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard
                isLoading={isLoopsDataLoading}
                label="APR"
                value={fNum('apr', loopsApr)}
              />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard
                isLoading={isLoopsDataLoading}
                label="TVL"
                value={toCurrency(loopsTVL)}
              />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)" borderRadius="lg">
              <GlobalStatsCard
                isLoading={isLoopsDataLoading}
                label="NAV ($S)"
                value={fNum('token', loopsNav)}
              />
            </GridItem>
          </Grid>
        </Box>
      </NoisyCard>
    </Card>
  )
}

import { useProtocolStats } from '@/lib/shared/hooks/useProtocolStats'
import { Center, Box, Text, SimpleGrid, Skeleton } from '@chakra-ui/react'
import { useMemo } from 'react'
import { AnimatedNumber } from '@/lib/shared/components/marketing/AnimatedNumber'
import { Picture } from '@/lib/shared/components/other/Picture'
import { ParallaxImage } from '@/lib/shared/components/marketing/ParallaxImage'

type ProtocolStatsSectionProps = {
  title: string
  imgName: string
  value: string
  isLoading?: boolean
}
function ProtocolStatItem({ title, value, imgName, isLoading }: ProtocolStatsSectionProps) {
  const formatValue = (v: number) => {
    if (title === 'LPs') return v.toLocaleString()
    return '$' + abbreviateNumber(v)
  }

  return (
    <ParallaxImage yStart="0%" yEnd="-2%" transformOrigin="top" overflow="none" scaleStart="95">
      <Box position="relative" rounded="full">
        <Center>
          <Box rounded="full" className="enso">
            <Picture
              imgName={imgName}
              altText="Liquidity pools"
              defaultImgType="png"
              imgPngDark={true}
              imgPng={true}
            />
          </Box>

          <Box
            textAlign="center"
            position="absolute"
            top="46%"
            left="50%"
            transform="translate(-50%,-50%)"
            zIndex="10"
            width="full"
            px="ms"
          >
            <Box pb="xxs">
              <Text fontSize={{ base: 'sm', md: 'md' }} color="font.dark">
                {title}
              </Text>
            </Box>
            <Box position="absolute" left="50%" transform="translateX(-50%)">
              {isLoading ? (
                <Skeleton height="8" w="16" />
              ) : (
                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="font.dark">
                  <AnimatedNumber
                    value={parseFloat(value.replace(/[^0-9.-]+/g, ''))}
                    formatValue={formatValue}
                  />
                </Text>
              )}
            </Box>
          </Box>
        </Center>
      </Box>
    </ParallaxImage>
  )
}

export function ProtocolStatsSection() {
  const { statQuery } = useProtocolStats()

  const stats = useMemo(() => {
    const data = statQuery.data?.protocolMetricsAggregated
    const totalLiquidity = data?.totalLiquidity ?? 0
    const swapVolume24h = data?.swapVolume24h ?? 0
    const numLiquidityProviders = data?.numLiquidityProviders ?? 0
    const swapFee24h = data?.swapFee24h ?? 0

    return [
      {
        title: 'TVL',
        value: totalLiquidity,
        imgName: 'enso1',
      },
      {
        title: 'Vol 24h',
        value: swapVolume24h,
        imgName: 'enso2',
      },
      {
        title: 'Swap fees 24h',
        value: swapFee24h,
        imgName: 'enso3',
      },
      {
        title: 'LPs',
        value: numLiquidityProviders,
        imgName: 'enso4',
      },
    ]
  }, [statQuery.data])

  return (
    <SimpleGrid
      columns={{ base: 2, md: 4 }}
      spacing={{ base: 6, md: 8 }}
      maxW={{ base: '500px', md: '100%' }}
    >
      {stats.map((stat, index) => (
        <ProtocolStatItem
          key={index}
          title={stat.title}
          value={stat.value.toString()}
          imgName={stat.imgName}
          isLoading={statQuery.loading}
        />
      ))}
    </SimpleGrid>
  )
}

function abbreviateNumber(num: number): string {
  const abbreviations = [
    { value: 1e12, symbol: 't' },
    { value: 1e9, symbol: 'b' },
    { value: 1e6, symbol: 'm' },
    { value: 1e3, symbol: 'k' },
  ]

  for (const abbreviation of abbreviations) {
    if (num >= abbreviation.value) {
      return (num / abbreviation.value).toFixed(2) + abbreviation.symbol
    }
  }

  return num.toString()
}

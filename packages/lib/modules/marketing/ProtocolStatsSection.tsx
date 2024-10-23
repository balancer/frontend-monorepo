import { useProtocolStats } from '@repo/lib/shared/hooks/useProtocolStats'
import { Center, Box, Text, SimpleGrid, Skeleton } from '@chakra-ui/react'
import { useMemo } from 'react'
import { AnimatedNumber } from '@repo/lib/shared/components/marketing/AnimatedNumber'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { ParallaxImage } from '@repo/lib/shared/components/marketing/ParallaxImage'

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
    <ParallaxImage overflow="none" scaleStart="95" transformOrigin="top" yEnd="-2%" yStart="0%">
      <Box position="relative" rounded="full">
        <Center>
          <Box className="enso" rounded="full">
            <Picture
              altText="Liquidity pools"
              defaultImgType="png"
              imgName={imgName}
              imgPng
              imgPngDark
            />
          </Box>

          <Box
            left="50%"
            position="absolute"
            px="ms"
            textAlign="center"
            top="46%"
            transform="translate(-50%,-50%)"
            width="full"
            zIndex="10"
          >
            <Box pb="xxs">
              <Text color="font.dark" fontSize={{ base: 'sm', md: 'md' }}>
                {title}
              </Text>
            </Box>
            <Box left="50%" position="absolute" transform="translateX(-50%)">
              {isLoading ? (
                <Skeleton height="8" w="16" />
              ) : (
                <Text color="font.dark" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
                  <AnimatedNumber
                    formatValue={formatValue}
                    value={parseFloat(value.replace(/[^0-9.-]+/g, ''))}
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
      maxW={{ base: '500px', md: '100%' }}
      spacing={{ base: 6, md: 8 }}
    >
      {stats.map((stat, index) => (
        <ProtocolStatItem
          imgName={stat.imgName}
          isLoading={statQuery.loading}
          key={index}
          title={stat.title}
          value={stat.value.toString()}
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

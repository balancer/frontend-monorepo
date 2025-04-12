'use client'

import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Box, Skeleton, Flex, Heading, Text } from '@chakra-ui/react'
import { PropsWithChildren, Suspense } from 'react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import { PoolPageStats } from './PoolPageStats'
import { FeaturedPartners } from './FeaturedPartners'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { fNumCustom } from '../../utils/numbers'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'

export function PoolsPage({
  children,
  additionalFees,
}: PropsWithChildren & { additionalFees?: string }) {
  const { protocolData } = useProtocolStats()

  return (
    <>
      <Box borderBottom="1px solid" borderColor="border.base">
        <Noise
          backgroundColor="background.level0WithOpacity"
          overflow="hidden"
          position="relative"
          shadow="innerBase"
        >
          <DefaultPageContainer pb={['xl', 'xl', '10']} pt={['xl', '40px']}>
            <Box display={{ base: 'none', md: 'block' }}>
              <RadialPattern
                circleCount={8}
                height={600}
                innerHeight={150}
                innerWidth={500}
                padding="15px"
                position="absolute"
                right={{ base: -800, lg: -700, xl: -600, '2xl': -400 }}
                top="40px"
                width={1000}
              />
              <RadialPattern
                circleCount={8}
                height={600}
                innerHeight={150}
                innerWidth={500}
                left={{ base: -800, lg: -700, xl: -600, '2xl': -400 }}
                padding="15px"
                position="absolute"
                top="40px"
                width={1000}
              />
            </Box>
            <RadialPattern
              circleCount={8}
              height={600}
              innerHeight={150}
              innerWidth={150}
              left="calc(50% - 300px)"
              position="absolute"
              top="-300px"
              width={600}
            />
            <RadialPattern
              circleCount={8}
              height={600}
              innerHeight={150}
              innerWidth={150}
              left="calc(50% - 300px)"
              position="absolute"
              top="300px"
              width={600}
            />
            <FadeInOnView animateOnce={false}>
              <Flex
                align={{ base: 'start', md: 'start' }}
                direction={{ base: 'column', lg: 'row' }}
                gap="4"
                justify={{ base: 'start', md: 'space-between' }}
                mb="10"
              >
                <Box>
                  <Heading pb="3" sx={{ textWrap: 'balance' }} variant="special">
                    Earn passively on {PROJECT_CONFIG.projectName}
                  </Heading>
                  <Text sx={{ textWrap: 'balance' }} variant="secondary">
                    {`Join ${fNumCustom(protocolData?.protocolMetricsAggregated.numLiquidityProviders || '0', '0a')}+ Liquidity Providers in yield-bearing pools`}
                  </Text>
                </Box>
                <PoolPageStats additionalFees={additionalFees} />
              </Flex>
            </FadeInOnView>
            <FadeInOnView animateOnce={false}>
              <Box pb="3">
                {/* <BeetsPromoBanner /> */}
                {children}
              </Box>
            </FadeInOnView>
            {/* <FadeInOnView animateOnce={false}>
            <Box pt="20" pb="4">
              <FeaturedPools featuredPools={featuredPools} />
            </Box>
          </FadeInOnView> */}
          </DefaultPageContainer>
        </Noise>
      </Box>
      <DefaultPageContainer noVerticalPadding pb="xl" pt={['lg', '54px']}>
        <FadeInOnView animateOnce={false}>
          <Suspense fallback={<Skeleton h="500px" w="full" />}>
            <PoolList />
          </Suspense>
        </FadeInOnView>
      </DefaultPageContainer>
      <DefaultPageContainer mb="3xl" py="0" rounded="2xl">
        <FeaturedPartners />
      </DefaultPageContainer>
    </>
  )
}

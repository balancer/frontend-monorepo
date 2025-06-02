import { Box, Grid, GridItem, VStack } from '@chakra-ui/react'
import { PoolBreadcrumbs } from '../../PoolDetail/PoolHeader/PoolBreadcrumbs'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import { PoolPageStats } from '@repo/lib/shared/pages/PoolsPage/PoolPageStats'
import { LbpHeaderTitleDescription } from './LbpHeaderTitleDescription'
import { LbpHeaderTimeInfo } from '@repo/lib/modules/pool/LbpDetail/LbpHeader/LbpHeaderTimeInfo'

export function LbpHeader() {
  return (
    <Box borderBottom="1px solid" borderColor="border.base">
      <Noise
        backgroundColor="background.level0WithOpacity"
        overflow="hidden"
        position="relative"
        shadow="innerBase"
      >
        <DefaultPageContainer
          pb={['xl', 'xl', '10']}
          pr={{ base: '0 !important', md: 'md !important' }}
          pt={['xl', '40px']}
        >
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
            <VStack align="start" w="full">
              <PoolBreadcrumbs />
              <Grid templateColumns={{ base: '1fr', md: '3fr 2fr' }} gap="4" w="full">
                <GridItem p="md">
                  <LbpHeaderTitleDescription />
                </GridItem>
                <GridItem p="md">
                  <VStack align="start" h="full">
                    <LbpHeaderTimeInfo />
                    <Box mt="auto">
                      <PoolPageStats />
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </VStack>
          </FadeInOnView>
        </DefaultPageContainer>
      </Noise>
    </Box>
  )
}

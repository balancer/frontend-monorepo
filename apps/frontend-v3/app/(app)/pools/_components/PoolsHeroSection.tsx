import { Box, Flex, Heading } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { PoolPageStats } from '@repo/lib/shared/pages/PoolsPage/PoolPageStats'

export function PoolsHeroSection({ children }: { children: React.ReactNode }) {
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
                <PoolPageStats />
              </Box>
            </Flex>
          </FadeInOnView>
          <FadeInOnView animateOnce={false}>
            <Box pb={{ base: '0', md: '3' }}>{children}</Box>
          </FadeInOnView>
        </DefaultPageContainer>
      </Noise>
    </Box>
  )
}

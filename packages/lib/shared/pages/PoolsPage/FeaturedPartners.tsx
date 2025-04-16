'use client'

import { Box, Flex, Card, Center, Text, useColorMode } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import { PartnerCard } from '@repo/lib/shared/components/other/PartnerCard'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export function FeaturedPartners() {
  const partnerCards = PROJECT_CONFIG.partnerCards
  const { colorMode } = useColorMode()

  return partnerCards?.length ? (
    <Card mb="md">
      <Center>
        <Text
          color="font.secondary"
          fontSize="11px"
          opacity="0.75"
          position="relative"
          textShadow={
            colorMode === 'dark'
              ? '0px 1px 1px rgba(0, 0, 0, 0.9)'
              : '0px 1px 1px rgba(0, 0, 0, 0.15)'
          }
          top="-8px"
          variant="eyebrow"
        >
          Featured partner pools
        </Text>
      </Center>
      <Noise
        backgroundColor="background.level0WithOpacity"
        overflow="hidden"
        position="relative"
        shadow="innerBase"
      >
        <Box opacity="0.6">
          <RadialPattern
            circleCount={20}
            height={1500}
            innerHeight={150}
            innerWidth={150}
            left="calc(50% - 750px)"
            position="absolute"
            top="calc(50% - 750px)"
            width={1500}
          />
        </Box>
        <FadeInOnView animateOnce={false}>
          <Box p={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}>
            <Box maxW="7xl" mx="auto">
              <Flex flexWrap="wrap" gap={{ base: 4, md: 5 }}>
                {partnerCards.map((partnerCard, index) => (
                  <Box
                    flex={{
                      base: '1 1 100%',
                      sm: index === 0 ? '1 1 100%' : '1 1 calc(50% - 10px)',
                      md: '1 1 30%',
                    }}
                    key={partnerCard.title}
                  >
                    <PartnerCard {...partnerCard} />
                  </Box>
                ))}
              </Flex>
            </Box>
          </Box>
        </FadeInOnView>
      </Noise>
    </Card>
  ) : null
}

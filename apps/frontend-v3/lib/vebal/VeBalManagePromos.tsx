import { Box, Heading, Link, Text, useColorMode } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { Stack, SimpleGrid, Flex, Center } from '@chakra-ui/react'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { SparkleIconWrapper } from '@repo/lib/shared/components/animations/SparkleIconWrapper'
import { VebalBenefitsSyncIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsSyncIcon'
import { VebalBenefitsSparklesIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsSparklesIcon'

export function VeBalManagePromos() {
  const { colorMode } = useColorMode()

  const gridItems = [
    {
      icon: (
        <SparkleIconWrapper size={49}>
          <VebalBenefitsSyncIcon />
        </SparkleIconWrapper>
      ),
      title: 'Cross-chain sync for max boosts',
      description: (
        <Box as="span">
          Sync your veBAL balance to L2s to maximize veBAL boosted liquidity incentives. Sync on the{' '}
          <Link
            href="https://app.balancer.fi/#/ethereum/vebal"
            style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'baseline' }}
            target="_blank"
          >
            legacy site
            <ArrowUpRight size={12} style={{ marginLeft: 2 }} />
          </Link>
        </Box>
      ),
    },
    {
      icon: (
        <SparkleIconWrapper size={41}>
          <VebalBenefitsSparklesIcon />
        </SparkleIconWrapper>
      ),
      title: 'Claim veBAL incentives',
      description: (
        <Box as="span">
          Protocol revenue and incentives from holding veBAL and staking can be claimed on the{' '}
          <Link
            href="/portfolio"
            style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'baseline' }}
          >
            Portfolio page
          </Link>
          .
        </Box>
      ),
    },
  ]

  return (
    <Stack alignItems="center" gap="md" margin="0" px="0" width="full">
      <SimpleGrid
        alignItems="stretch"
        columns={{ base: 1, md: 2 }}
        mb="2xl"
        spacing={{ base: 'ms', md: 'md', lg: 'lg' }}
        w="full"
      >
        {gridItems.map(item => (
          <FadeInOnView animateOnce={false} key={item.title}>
            <Flex
              borderRadius="xl"
              flex="1"
              flexDirection="column"
              height="100%"
              justifyContent="center"
              overflow="hidden"
              p={{ base: 'ms', sm: 'md', md: 'xl' }}
              position="relative"
              shadow="2xl"
            >
              <Box bottom="0" left="0" position="absolute" right="0" top="0">
                <Picture
                  altText="Background texture"
                  defaultImgType="png"
                  directory="/images/textures/"
                  height="100%"
                  imgAvif
                  imgAvifDark
                  imgAvifPortrait
                  imgAvifPortraitDark
                  imgName="rock-slate"
                  imgPng
                  imgPngDark
                  width="100%"
                />
              </Box>
              <Flex
                alignItems="center"
                direction="row"
                gap={{ base: 'ms', sm: 'md', lg: 'lg' }}
                position="relative"
                w="full"
                zIndex={2}
              >
                <Flex
                  alignItems="center"
                  borderRadius="full"
                  flexShrink={0}
                  justifyContent="center"
                >
                  <Box rounded="full" shadow="2xl">
                    <Box rounded="full" shadow="md">
                      <Box
                        alignItems="center"
                        color={colorMode === 'dark' ? 'font.light' : 'brown.300'}
                        display="flex"
                        fontSize="xs"
                        fontWeight="normal"
                        h={{ base: 16, lg: 20, xl: 24 }}
                        overflow="hidden"
                        rounded="full"
                        shadow="innerRockShadowSm"
                        w={{ base: 16, lg: 20, xl: 24 }}
                      >
                        <Box
                          h={{ base: 16, lg: 20, xl: 24 }}
                          overflow="hidden"
                          position="absolute"
                          rounded="full"
                          w={{ base: 16, lg: 20, xl: 24 }}
                          zIndex="-1"
                        >
                          <Picture
                            altText="Rock texture"
                            defaultImgType="jpg"
                            directory="/images/homepage/"
                            height={24}
                            imgAvif
                            imgAvifDark
                            imgJpg
                            imgJpgDark
                            imgName="stone"
                            width={24}
                          />
                        </Box>
                        <Center h="full" w="full">
                          {item.icon}
                        </Center>
                      </Box>
                    </Box>
                  </Box>
                </Flex>
                <Box>
                  <Heading
                    as="h3"
                    bg="background.gold"
                    bgClip="text"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    mb={{ base: 'xxs', md: '2' }}
                    pb="0.5"
                    sx={{ textWrap: 'balance' }}
                  >
                    {item.title}
                  </Heading>
                  <Text
                    color="font.secondary"
                    fontSize={{ base: 'sm', md: 'md' }}
                    lineHeight="1.4"
                    pb="0.5"
                    sx={{ textWrap: 'balance' }}
                  >
                    {item.description}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </FadeInOnView>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

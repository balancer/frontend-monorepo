import { SimpleGrid, Flex, Box, Heading, Stack, Text, Center, useColorMode } from '@chakra-ui/react'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { VebalBenefitsVoteIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsVoteIcon'
import { VebalBenefitsShareIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsShareIcon'
import { VebalBenefitsBribesIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsBribesIcon'
import { VebalBenefitsSparklesIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsSparklesIcon'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export function VebalBenefitsSection() {
  const { colorMode } = useColorMode()
  const benefits = [
    {
      icon: <VebalBenefitsVoteIcon size={44} />,
      title: "Vote on Balancer's future",
      description:
        'veBAL holders govern the direction of the protocol including liquidity incentives.',
    },
    {
      icon: <VebalBenefitsShareIcon size={44} />,
      title: 'Share protocol revenue',
      description:
        'veBAL holders earn a share of protocol revenue in proportion to their holdings.',
    },
    {
      icon: <VebalBenefitsBribesIcon size={42} />,
      title: 'Earn weekly voting incentives',
      description:
        "veBAL holders can earn lucrative 'bribes' from 3rd parties for voting for their pools.",
    },
    {
      icon: <VebalBenefitsSparklesIcon size={38} />,
      title: 'Boost liquidity mining yield',
      description:
        'Liquidity Providers with veBAL can get up to a 2.5x boost on BAL liquidity incentives.',
    },
  ]

  return (
    <Stack
      alignItems="center"
      gap="md"
      margin="0 auto"
      maxWidth="container.xl"
      pt={{ base: '60px', md: '40' }}
      px={{ base: 'md', '2xl': '0' }}
      width="full"
    >
      <FadeInOnView animateOnce={false}>
        <Stack
          alignItems="center"
          gap="md"
          margin="0 auto"
          maxWidth="container.lg"
          px="md"
          width="full"
        >
          <Heading as="h2" bg="background.gold" bgClip="text" pb="0.5" size="lg" textAlign="center">
            Why get veBAL?
          </Heading>
          <Text color="font.secondary" maxWidth="38ch" pt="0" textAlign="center">
            Turn your BAL tokens into voting power and rewards.
          </Text>
        </Stack>
      </FadeInOnView>
      <SimpleGrid columns={{ base: 1, md: 2 }} mt="lg" spacing={{ base: 'ms', md: 'md', lg: 'lg' }}>
        {benefits.map(benefit => (
          <FadeInOnView animateOnce={false} key={benefit.title}>
            <Flex
              borderRadius="lg"
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
                        shadow="innerRockShadow"
                        w={{ base: 16, lg: 20, xl: 24 }}
                      >
                        <Box
                          h={16}
                          overflow="hidden"
                          position="absolute"
                          rounded="full"
                          w={16}
                          zIndex="-1"
                        >
                          <Picture
                            altText="Rock texture"
                            defaultImgType="jpg"
                            directory="/images/homepage/"
                            height={16}
                            imgAvif
                            imgAvifDark
                            imgJpg
                            imgJpgDark
                            imgName="stone"
                            width={16}
                          />
                        </Box>
                        <Center h="full" w="full">
                          {benefit.icon}
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
                    fontSize="xl"
                    mb={2}
                    pb="0.5"
                    sx={{ textWrap: 'balance' }}
                  >
                    {benefit.title}
                  </Heading>
                  <Text color="font.secondary" fontSize="md" sx={{ textWrap: 'balance' }}>
                    {benefit.description}
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
